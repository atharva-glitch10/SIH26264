"""Database-free tests for the NLP, matching, overlap, SLA and risk engines."""
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from backend.app.services.nlp_service import build_classifier, score_duplicate, suggest_priority
from backend.app.services.overlap_rules_engine import categories_related, evaluate_institution_overlap
from backend.app.services.risk_engine import compute_risk
from backend.app.services.sla_rules_engine import evaluate_sla_events
from backend.app.services.text_utils import (
    content_similarity, normalize_text, rank_name_candidates, semantic_similarity, strip_names,
)

RULES = {
    "rule_a_multi_bureau": {"enabled": True, "min_bureaus": 2, "min_cases": 2, "base_severity": "MEDIUM"},
    "rule_b_category_overlap": {"enabled": True, "severity_boost": "HIGH",
                                "category_clusters": [["Fee Related Grievances", "Admission Grievances"]]},
    "rule_c_description_similarity": {"enabled": True, "similarity_threshold": 70, "severity_boost": "CRITICAL"},
}


def test_classifier_predicts_obvious_categories():
    clf = build_classifier()
    assert clf.predict("college demanding capitation fee and no receipt")["category"] == "Fee Related Grievances"
    assert clf.predict("salary of teachers not paid for months")["category"] == "Faculty and Staffing"
    assert clf.predict("semester result not declared")["category"] == "Academic and Examination"
    p = clf.predict("hostel drinking water unsafe")
    assert p["category"] == "Infrastructure and Facilities" and 0 < p["confidence"] <= 1 and p["evidence"]


def test_classifier_learns_from_officer_corrections():
    clf = build_classifier([("zorblax compliance gizmo", "Regulatory Compliance")] * 5)
    assert clf.predict("zorblax gizmo")["category"] == "Regulatory Compliance"


def test_priority_hint():
    assert suggest_priority("seniors ragging juniors in hostel")["priority"] == "URGENT"
    assert suggest_priority("donation demanded for seat")["priority"] == "HIGH"
    assert suggest_priority("library books old")["priority"] == "MEDIUM"


def test_strip_names_removes_institution_name():
    assert "alpha" not in strip_names("Fictional Alpha Institute: fee issue", ["Fictional Alpha Institute"])


def test_paraphrases_are_similar_unrelated_are_not():
    assert semantic_similarity("Teachers not paid salary for five months",
                               "Faculty salaries pending five months") >= 70
    assert semantic_similarity("Hostel water contaminated", "Excess admission beyond intake") < 40
    assert content_similarity("Alpha: fee issue", "Alpha: hostel issue", ["Alpha"]) < 90


def test_duplicate_score_uses_complainant_and_text():
    now = datetime.now(timezone.utc)
    a = {"description": "capitation fee of 2 lakh demanded", "category": "F", "complainant_name": "Ravi", "received_at": now}
    b = {"description": "college demanding two lakh rupees capitation", "category": "F", "complainant_name": "Ravi",
         "received_at": now - timedelta(days=3)}
    c = {"description": "library has no books", "category": "I", "complainant_name": "Sita", "received_at": now}
    assert score_duplicate(a, b, [])["score"] >= 60
    assert score_duplicate(a, c, [])["score"] < 40


def test_name_ranking_prefers_distinctive_words():
    cands = [("A", normalize_text("Aryabhata Institute of Technology and Management")),
             ("B", normalize_text("Galaxy Institute of Technology and Management"))]
    ranked = rank_name_candidates(normalize_text("Aryabhata Instt of Tech & Mgmt"), cands, 50)
    assert ranked[0][1] == "A"
    assert ranked[0][0] - (ranked[1][0] if len(ranked) > 1 else 0) >= 10


def test_overlap_rules():
    assert categories_related("Fee Related Grievances", "Admission Grievances", RULES["rule_b_category_overlap"]["category_clusters"])
    cases = [SimpleNamespace(case_id="1", current_bureau_id="RB", category="Fee Related Grievances", priority="LOW",
                             description="capitation fee demanded"),
             SimpleNamespace(case_id="2", current_bureau_id="PGRC", category="Admission Grievances", priority="LOW",
                             description="seat not allotted after counselling")]
    res = evaluate_institution_overlap(cases, RULES, [])
    assert res["rules_triggered"] == "A,B" and res["severity"] == "HIGH"
    cases[1].current_bureau_id = "RB"
    assert evaluate_institution_overlap(cases, RULES, []) is None


def test_sla_events():
    now = datetime.now(timezone.utc)
    rules = {"reminder_windows_days": [7, 3, 1], "stagnant_case_threshold_days": 14,
             "transfer_acknowledgment_days": 5, "auto_escalation_enabled": True, "escalation_threshold_ratio": 1.5}
    due_soon = {"case_id": "X", "status": "UNDER_PROCESS", "received_at": now - timedelta(days=28),
                "expected_disposal_at": now + timedelta(days=2), "last_action_at": now}
    assert [e["tag"] for e in evaluate_sla_events(due_soon, rules, now)["events"]] == ["[SLA-3d]"]
    very_late = {"case_id": "Y", "status": "TRANSFERRED", "received_at": now - timedelta(days=50),
                 "expected_disposal_at": now - timedelta(days=20), "last_action_at": now - timedelta(days=10)}
    res = evaluate_sla_events(very_late, rules, now)
    assert {"[BREACH]", "[XFER-ACK]"} <= {e["tag"] for e in res["events"]} and res["auto_escalate"]
    done = dict(very_late, status="DISPOSED")
    assert evaluate_sla_events(done, rules, now)["events"] == []


def test_risk_engine_levels():
    now = datetime.now(timezone.utc)
    quiet = compute_risk([], False, now)
    assert quiet["risk_level"] == "LOW" and quiet["risk_score"] == 0
    busy = [{"received_at": now - timedelta(days=i), "status": "UNDER_PROCESS", "priority": "HIGH",
             "expected_disposal_at": now - timedelta(days=1), "current_bureau_id": f"B{i % 3}",
             "category": "Fee Related Grievances"} for i in range(6)]
    res = compute_risk(busy, True, now)
    assert res["risk_level"] == "HIGH" and res["is_repeat_offender"] and res["risk_factors"]

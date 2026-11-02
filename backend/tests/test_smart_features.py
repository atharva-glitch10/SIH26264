"""Tests for smart intake, bulk import, duplicate detection, SLA monitor, risk score and RBAC."""
from datetime import datetime, timedelta, timezone

import pytest

from backend.app.models.models import Case, CaseAction, InstitutionAlias, Notification, OverlapAlert, RelatedCase
from backend.app.services.import_service import run_import
from backend.app.services.institution_service import get_institution_metrics
from backend.app.services.intake_service import IntakeError, process_intake, set_duplicate_decision
from backend.app.services.matching_service import normalize_text
from backend.app.services.overlap_service import scan_and_generate_overlap_alerts
from backend.app.services.sla_monitor_service import run_sla_scan




def _case(db, case_id, bureau, category, description, status="UNDER_PROCESS", days_ago=5, sla_days=30,
          institution_id="INST-1001", last_action_days_ago=1):
    now = datetime.now(timezone.utc)
    c = Case(case_id=case_id, complaint_reference=f"REF-{case_id}", institution_id=institution_id,
             source_bureau_id=bureau, current_bureau_id=bureau, category=category, priority="MEDIUM",
             description=description, status=status, received_at=now - timedelta(days=days_ago),
             last_action_at=now - timedelta(days=last_action_days_ago),
             expected_disposal_at=now - timedelta(days=days_ago) + timedelta(days=sla_days))
    db.add(c)
    db.commit()
    return c


def test_public_status_is_unauthenticated_and_exposes_no_personal_data(client, db_session):
    c = _case(db_session, "CASE-PUB-1", "BUR-PGRC", "Fee Related Grievances", "Secret description text")
    c.complaint_reference = "AICTE/PGRC/2026/00001"
    c.complainant_name, c.complainant_contact = "Jane Complainant", "+91-9123456789"
    c.last_action_summary = "Forwarded for inquiry"
    db_session.commit()

    res = client.get("/api/v1/public/status/AICTE/PGRC/2026/00001")  # no Authorization header
    assert res.status_code == 200
    body = res.json()
    assert set(body) == {"status", "bureau_code", "received_at", "sla_due_at", "last_action_summary"}
    assert body["status"] == "UNDER_PROCESS" and body["bureau_code"] == "PGRC"
    assert "Jane" not in res.text and "9123456789" not in res.text and "Secret" not in res.text
    assert client.get("/api/v1/public/status/AICTE/PGRC/2026/99999").status_code == 404


# --------------------------------------------------------------------------- intake pipeline

def test_intake_links_by_permanent_id_and_autocategorises(db_session):
    out = process_intake(db_session, {
        "aicte_permanent_id": "1-4329811", "source_bureau_id": "BUR-PGRC",
        "description": "College is demanding donation of two lakh rupees and not giving fee receipt",
    }, actor_user_id="USR-PGRC-01")
    assert out["institution"]["institution_id"] == "INST-1001"
    assert out["institution"]["match_status"] == "AUTO_MATCHED"
    assert out["category"]["source"] == "AUTO"
    assert out["category"]["value"] == "Fee Related Grievances"
    case = db_session.query(Case).filter(Case.case_id == out["case_id"]).one()
    assert case.category_source == "AUTO" and case.category_confidence > 0


def test_officer_category_overrides_suggestion(db_session):
    out = process_intake(db_session, {
        "institution_id": "INST-1001", "source_bureau_id": "BUR-RB", "category": "Regulatory Compliance",
        "description": "College is demanding donation of two lakh rupees and not giving fee receipt",
    }, actor_user_id="USR-RB-01")
    assert out["category"]["value"] == "Regulatory Compliance"
    assert out["category"]["source"] == "MANUAL"


def test_ambiguous_name_goes_to_review_not_silent_merge(db_session):
    out = process_intake(db_session, {
        "institution_name": "Fictional Institution Alpha Institute", "source_bureau_id": "BUR-PGRC",
        "description": "Semester results have not been declared for three months",
    }, actor_user_id="USR-PGRC-01")
    assert out["institution"]["match_status"] == "PENDING_REVIEW"
    assert out["institution"]["queue_id"] is not None


def test_unknown_institution_rejected(db_session):
    with pytest.raises(IntakeError):
        process_intake(db_session, {
            "institution_name": "Totally Unknown Academy of Wizardry", "source_bureau_id": "BUR-PGRC",
            "description": "Semester results have not been declared for three months",
        }, actor_user_id="USR-PGRC-01")


def test_cross_bureau_duplicate_is_flagged_and_can_be_dismissed(db_session):
    first = process_intake(db_session, {
        "institution_id": "INST-1001", "source_bureau_id": "BUR-PGRC", "complainant_name": "Ravi Kumar",
        "description": "Teachers have not been paid salary for the last five months",
    }, actor_user_id="USR-PGRC-01")
    second = process_intake(db_session, {
        "institution_id": "INST-1001", "source_bureau_id": "BUR-RB", "complainant_name": "Ravi Kumar",
        "description": "Faculty salaries pending for five months and management not responding",
    }, actor_user_id="USR-RB-01")
    assert second["duplicate"] is not None
    assert second["duplicate"]["case_id"] == first["case_id"]
    rel = db_session.query(RelatedCase).filter(RelatedCase.source_case_id == second["case_id"]).one()
    assert rel.relationship_type == "DUPLICATE_SUBMISSION" and rel.decision_status == "PROPOSED"
    assert db_session.query(Notification).filter(Notification.alert_type == "DUPLICATE_SUSPECTED").count() >= 1

    set_duplicate_decision(db_session, second["case_id"], "DISMISSED", "USR-RB-01")
    case = db_session.query(Case).filter(Case.case_id == second["case_id"]).one()
    assert case.duplicate_of_case_id is None


def test_unrelated_complaints_not_flagged_as_duplicates(db_session):
    process_intake(db_session, {"institution_id": "INST-1001", "source_bureau_id": "BUR-PGRC",
                                "description": "Hostel drinking water is contaminated and students are sick"},
                   actor_user_id="USR-PGRC-01")
    second = process_intake(db_session, {"institution_id": "INST-1001", "source_bureau_id": "BUR-RB",
                                         "description": "Institute admitted more students than sanctioned intake in CSE"},
                            actor_user_id="USR-RB-01")
    assert second["duplicate"] is None


def test_ids_do_not_collide_after_delete(db_session):
    a = process_intake(db_session, {"institution_id": "INST-1001", "source_bureau_id": "BUR-PGRC",
                                    "description": "Hostel drinking water is contaminated"}, actor_user_id="X")
    b = process_intake(db_session, {"institution_id": "INST-1001", "source_bureau_id": "BUR-PGRC",
                                    "description": "Library has no prescribed textbooks"}, actor_user_id="X")
    db_session.query(Case).filter(Case.case_id == a["case_id"]).delete()
    db_session.commit()
    c = process_intake(db_session, {"institution_id": "INST-1001", "source_bureau_id": "BUR-PGRC",
                                    "description": "Computer lab systems are not working"}, actor_user_id="X")
    assert c["case_id"] not in (b["case_id"],)
    assert c["complaint_reference"] != b["complaint_reference"]


# --------------------------------------------------------------------------- overlap rules

def test_rule_b_uses_category_clusters(db_session):
    _case(db_session, "C-1", "BUR-RB", "Regulatory Compliance", "Approval norms violated")
    _case(db_session, "C-2", "BUR-PGRC", "Infrastructure and Facilities", "Hostel unsafe and no labs")
    alert = scan_and_generate_overlap_alerts(db_session, "INST-1001")[0]
    assert "B" in alert.rules_triggered.split(",")
    assert alert.severity in ("HIGH", "CRITICAL")


def test_same_bureau_cases_do_not_raise_overlap(db_session):
    _case(db_session, "C-1", "BUR-RB", "Regulatory Compliance", "Approval norms violated")
    _case(db_session, "C-2", "BUR-RB", "Regulatory Compliance", "Approval norms violated again")
    assert scan_and_generate_overlap_alerts(db_session, "INST-1001") == []


def test_institution_name_alone_does_not_trigger_rule_c(db_session):
    _case(db_session, "C-1", "BUR-RB", "Admission Grievances",
          "Fictional Institution Alpha: merit list for admissions not published")
    _case(db_session, "C-2", "BUR-PGRC", "Faculty and Staffing",
          "Fictional Institution Alpha: faculty salary pending for months")
    alert = scan_and_generate_overlap_alerts(db_session, "INST-1001")[0]
    assert "C" not in alert.rules_triggered.split(",")


# --------------------------------------------------------------------------- SLA monitor + risk

def test_sla_scan_creates_alerts_once_and_auto_escalates(db_session):
    _case(db_session, "C-OVER", "BUR-RB", "Regulatory Compliance", "Very old case", days_ago=80, sla_days=30,
          last_action_days_ago=30)
    _case(db_session, "C-SOON", "BUR-PGRC", "Fee Related Grievances", "Due soon", days_ago=27, sla_days=30)
    first = run_sla_scan(db_session)
    assert first["notifications_created"].get("SLA_BREACHED") == 1
    assert first["notifications_created"].get("SLA_APPROACHING") == 1
    assert "C-OVER" in first["auto_escalated"]
    second = run_sla_scan(db_session)
    assert second["notifications_created"].get("SLA_BREACHED") is None  # idempotent
    escalation = db_session.query(CaseAction).filter(CaseAction.case_id == "C-OVER",
                                                    CaseAction.action_type == "ESCALATED").one()
    assert escalation.actor_user_id == "SYSTEM"


def test_risk_score_flags_repeat_offender(db_session):
    for i in range(4):
        _case(db_session, f"C-F{i}", "BUR-PGRC" if i % 2 else "BUR-RB", "Fee Related Grievances", f"Fee issue {i}")
    m = get_institution_metrics(db_session, "INST-1001")
    assert m["is_repeat_offender"] is True
    assert m["risk_score"] >= 30
    assert any("Fee Related Grievances" in f for f in m["risk_factors"])


# --------------------------------------------------------------------------- bulk import

CSV = (
    "Complaint No,Received Date,Name of Institution,AICTE Permanent ID,Bureau,Complainant,Complaint Details\n"
    "P-1,03/10/2026,,1-4329811,PGRC,Sneha,College demanding donation of two lakh for admission\n"
    "P-2,04/10/2026,Unknown Wizard Academy,,PGRC,Arjun,Semester results not declared for three months\n"
    "P-3,32/10/2026,,1-4329811,PGRC,Meera,Hostel water contaminated and students sick\n"
    "P-1,03/10/2026,,1-4329811,PGRC,Sneha,College demanding donation of two lakh for admission\n"
)


def test_bulk_import_reports_each_row(db_session):
    res = run_import(db_session, CSV.encode(), "batch.csv", actor_user_id="USR-PGRC-01")
    statuses = [r["status"] for r in res["rows"]]
    assert statuses == ["CREATED", "REJECTED", "REJECTED", "SKIPPED_ALREADY_IMPORTED"]
    assert res["created"] == 1 and res["rejected"] == 2 and res["skipped_already_imported"] == 1
    assert res["auto_categorized"] == 1
    assert res["import_id"].startswith("IMP-")


def test_bulk_import_dry_run_saves_nothing(db_session):
    before = db_session.query(Case).count()
    res = run_import(db_session, CSV.encode(), "batch.csv", actor_user_id="USR-PGRC-01", dry_run=True)
    assert res["dry_run"] is True
    assert db_session.query(Case).count() == before


def test_officer_cannot_import_other_bureau_rows(db_session):
    res = run_import(db_session, CSV.encode(), "batch.csv", actor_user_id="USR-RB-01",
                     allowed_bureau_id="BUR-RB")
    assert res["created"] == 0
    assert all(r["status"] in ("REJECTED",) for r in res["rows"])


# --------------------------------------------------------------------------- auth & RBAC (HTTP)

def _token(client, user_id):
    r = client.post("/api/v1/auth/login", json={"username": user_id, "password": "test-pass"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_endpoints_require_login(client):
    assert client.get("/api/v1/cases").status_code == 401
    assert client.post("/api/v1/auth/login", json={"username": "USR-RB-01", "password": "wrong"}).status_code == 401


def test_officer_can_view_all_but_only_act_on_own_bureau(client, db_session):
    _case(db_session, "C-PG", "BUR-PGRC", "Fee Related Grievances", "Fee issue for RBAC test")
    rb = _token(client, "USR-RB-01")
    assert client.get("/api/v1/cases/C-PG", headers=rb).status_code == 200  # cross-bureau visibility
    r = client.post("/api/v1/cases/C-PG/escalate", json={"reason": "test"}, headers=rb)
    assert r.status_code == 403
    pg = _token(client, "USR-PGRC-01")
    assert client.post("/api/v1/cases/C-PG/escalate", json={"reason": "test"}, headers=pg).status_code == 200


def test_actor_comes_from_token_not_request_body(client, db_session):
    _case(db_session, "C-PG2", "BUR-PGRC", "Fee Related Grievances", "Fee issue")
    pg = _token(client, "USR-PGRC-01")
    client.post("/api/v1/cases/C-PG2/escalate", json={"reason": "x", "actor_user_id": "USR-SUPER-01"}, headers=pg)
    act = db_session.query(CaseAction).filter(CaseAction.case_id == "C-PG2", CaseAction.action_type == "ESCALATED").one()
    assert act.actor_user_id == "USR-PGRC-01"


def test_regional_officer_is_read_only(client, db_session):
    _case(db_session, "C-RO", "BUR-RB", "Regulatory Compliance", "Norms violated")
    ro = _token(client, "USR-REG-01")
    assert client.get("/api/v1/dashboard/summary", headers=ro).status_code == 200
    assert client.post("/api/v1/cases/C-RO/escalate", json={"reason": "x"}, headers=ro).status_code == 403


def test_register_via_api_with_name_only(client):
    admin = _token(client, "USR-SUPER-01")
    r = client.post("/api/v1/cases", headers=admin, json={
        "institution_name": "Alpha Tech Kanpur", "source_bureau_id": "BUR-PGRC",
        "description": "Transfer certificate not issued after graduation"})
    # 'Alpha Tech Kanpur' is not a verified alias in the test DB, so it may need review or be rejected;
    # either way the API must answer cleanly (201 or 400), never 500.
    assert r.status_code in (201, 400)


def test_terms_acceptance_is_recorded_per_user(client, db_session):
    headers = _token(client, "USR-RB-01")
    assert client.get("/api/v1/auth/me", headers=headers).json()["terms_accepted_at"] is None
    r = client.post("/api/v1/auth/accept-terms", headers=headers)
    assert r.status_code == 200 and r.json()["terms_accepted_at"]
    assert client.get("/api/v1/auth/me", headers=headers).json()["terms_accepted_at"] is not None
    # another officer is unaffected, and the endpoint needs a login
    assert client.get("/api/v1/auth/me", headers=_token(client, "USR-PGRC-01")).json()["terms_accepted_at"] is None
    assert client.post("/api/v1/auth/accept-terms").status_code == 401

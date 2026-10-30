"""
Smart complaint intake pipeline (the PS workflow: Ingest -> Link -> Deduplicate & Classify -> Alert).

Every complaint, whether typed in the UI, uploaded in a bureau's Excel sheet, or
pushed by another system through the API, goes through `process_intake`:

1. Link to institution  - exact AICTE Permanent ID / name / verified alias, then
                           fuzzy matching with an ambiguity guard. Uncertain links
                           are created as PENDING_REVIEW and queued for an officer.
2. Classify             - Naive Bayes category suggestion with confidence and
                           evidence words (officer-supplied category always wins).
3. Prioritise           - keyword-based priority hint when none is supplied.
4. Detect duplicates    - compares against the institution's recent cases in ALL
                           bureaus; likely repeats are linked as PROPOSED duplicates.
5. Alert                - cross-bureau overlap scan + notifications.
"""
import json
import threading
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.ids import next_case_id, next_complaint_reference
from backend.app.models.models import (
    Bureau, Case, CaseAction, Institution, Notification, OverlapAlert, RelatedCase, User,
)
from backend.app.services.audit_service import record_audit_log
from backend.app.services.matching_service import match_institution
from backend.app.services.nlp_seed import CATEGORIES
from backend.app.services.nlp_service import ComplaintClassifier, build_classifier, score_duplicate, suggest_priority
from backend.app.services.overlap_service import scan_and_generate_overlap_alerts, OPEN_ALERT_STATUSES
from backend.app.services.sla_service import calculate_expected_disposal_date

PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"]


class IntakeError(ValueError):
    """Raised when a complaint cannot be registered (bad bureau, unknown institution ...)."""


# --------------------------------------------------------------------------- config

def load_intake_config() -> Dict[str, Any]:
    cfg: Dict[str, Any] = {}
    if settings.OVERLAP_RULES_PATH.exists():
        with open(settings.OVERLAP_RULES_PATH, "r", encoding="utf-8") as f:
            cfg = json.load(f)
    dup = cfg.get("duplicate_detection", {})
    cls = cfg.get("classification", {})
    return {
        "duplicate_enabled": dup.get("enabled", True),
        "lookback_days": int(dup.get("lookback_days", 180)),
        "duplicate_threshold": float(dup.get("threshold", 60.0)),
        "duplicate_weights": dup.get("weights"),
        "date_window_days": int(dup.get("date_window_days", 30)),
        "auto_apply_min_confidence": float(cls.get("auto_apply_min_confidence", 0.45)),
    }


# --------------------------------------------------------------------------- classifier cache

_classifier_lock = threading.Lock()
_classifier: Optional[ComplaintClassifier] = None


def get_classifier(db: Session) -> ComplaintClassifier:
    """Classifier trained on seed data + officer-confirmed (MANUAL) case categories."""
    global _classifier
    with _classifier_lock:
        if _classifier is None:
            rows = db.query(Case.description, Case.category).filter(
                (Case.category_source.is_(None)) | (Case.category_source == "MANUAL")
            ).limit(5000).all()
            _classifier = build_classifier((d, c) for d, c in rows)
        return _classifier


def invalidate_classifier() -> None:
    global _classifier
    with _classifier_lock:
        _classifier = None


# --------------------------------------------------------------------------- helpers

def _aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _get(data: Any, key: str, default=None):
    if isinstance(data, dict):
        return data.get(key, default)
    return getattr(data, key, default)


def _clean(value: Any) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def resolve_institution(db: Session, data: Any, dry_run: bool = False) -> Dict[str, Any]:
    inst_id = _clean(_get(data, "institution_id"))
    name = _clean(_get(data, "institution_name"))
    pid = _clean(_get(data, "aicte_permanent_id"))

    if inst_id:
        inst = db.query(Institution).filter(Institution.institution_id == inst_id).first()
        if not inst:
            raise IntakeError(f"Institution ID '{inst_id}' does not exist")
        return {"institution": inst, "status": "CONFIRMED", "score": 100.0,
                "method": "SELECTED_BY_OFFICER", "details": "Institution selected explicitly", "raw_name": name or inst.canonical_name}

    if not name and not pid:
        raise IntakeError("Provide institution_id, institution_name or aicte_permanent_id")

    match = match_institution(db, raw_name=name or "", aicte_permanent_id=pid, dry_run=dry_run)
    candidate_id = match.get("institution_id")
    if not candidate_id:
        raise IntakeError(f"Institution could not be identified from '{name or pid}': {match.get('details')}")
    inst = db.query(Institution).filter(Institution.institution_id == candidate_id).first()
    status = "AUTO_MATCHED" if match.get("matched") else "PENDING_REVIEW"
    return {"institution": inst, "status": status, "score": float(match.get("confidence_score") or 0.0),
            "method": match.get("matching_method"), "details": match.get("details"),
            "queue_id": match.get("queue_id"), "raw_name": name or pid}


def classify(db: Session, description: str, given_category: Optional[str]) -> Dict[str, Any]:
    prediction = get_classifier(db).predict(description)
    cfg = load_intake_config()
    if given_category:
        if given_category not in CATEGORIES:
            raise IntakeError(f"Unknown category '{given_category}'. Allowed: {', '.join(CATEGORIES)}")
        return {"value": given_category, "source": "MANUAL", "confidence": None,
                "suggested": prediction.get("category"), "suggested_confidence": prediction.get("confidence"),
                "alternatives": prediction.get("alternatives", []), "evidence": prediction.get("evidence", []),
                "needs_confirmation": False}
    if not prediction.get("category"):
        return {"value": "General Institutional", "source": "AUTO", "confidence": 0.0, "alternatives": [],
                "evidence": [], "needs_confirmation": True}
    return {"value": prediction["category"], "source": "AUTO", "confidence": prediction["confidence"],
            "alternatives": prediction.get("alternatives", []), "evidence": prediction.get("evidence", []),
            "needs_confirmation": prediction["confidence"] < cfg["auto_apply_min_confidence"]}


def find_duplicates(db: Session, institution: Institution, candidate: Dict[str, Any],
                    exclude_case_id: Optional[str] = None, limit: int = 3) -> List[Dict[str, Any]]:
    cfg = load_intake_config()
    if not cfg["duplicate_enabled"]:
        return []
    received = _aware(candidate.get("received_at")) or datetime.now(timezone.utc)
    since = received - timedelta(days=cfg["lookback_days"])
    names = [institution.canonical_name] + [a.alias_name for a in institution.aliases]
    results = []
    for c in db.query(Case).filter(Case.institution_id == institution.institution_id).all():
        if c.case_id == exclude_case_id:
            continue
        c_received = _aware(c.received_at)
        if c_received and c_received < since:
            continue
        res = score_duplicate(
            candidate,
            {"description": c.description, "category": c.category, "complainant_name": c.complainant_name,
             "complainant_contact": c.complainant_contact, "received_at": c_received},
            names, cfg["duplicate_weights"], cfg["date_window_days"],
        )
        if res["score"] >= cfg["duplicate_threshold"]:
            results.append({"case_id": c.case_id, "complaint_reference": c.complaint_reference,
                            "bureau_id": c.current_bureau_id, "status": c.status, **res})
    results.sort(key=lambda r: r["score"], reverse=True)
    return results[:limit]


# --------------------------------------------------------------------------- public API

def preview_intake(db: Session, data: Any) -> Dict[str, Any]:
    """Run the pipeline without saving anything (used for live suggestions in the UI)."""
    description = _clean(_get(data, "description")) or ""
    out: Dict[str, Any] = {"institution": None, "institution_error": None}
    try:
        link = resolve_institution(db, data, dry_run=True)
        inst = link["institution"]
        out["institution"] = {"institution_id": inst.institution_id, "canonical_name": inst.canonical_name,
                              "match_status": link["status"], "score": link["score"],
                              "method": link["method"], "details": link["details"]}
    except IntakeError as e:
        inst = None
        out["institution_error"] = str(e)
    out["category"] = classify(db, description, _clean(_get(data, "category"))) if description else None
    out["priority"] = suggest_priority(description) if description else None
    out["possible_duplicates"] = []
    if inst is not None and description:
        out["possible_duplicates"] = find_duplicates(db, inst, {
            "description": description,
            "category": out["category"]["value"] if out["category"] else None,
            "complainant_name": _clean(_get(data, "complainant_name")),
            "complainant_contact": _clean(_get(data, "complainant_contact")),
            "received_at": _get(data, "received_at"),
        })
    return out


def process_intake(db: Session, data: Any, actor_user_id: str, channel: str = "MANUAL",
                   run_overlap_scan: bool = True) -> Dict[str, Any]:
    description = _clean(_get(data, "description"))
    if not description or len(description) < 10:
        raise IntakeError("Complaint description is required (at least 10 characters)")

    bureau_id = _clean(_get(data, "source_bureau_id"))
    bureau = db.query(Bureau).filter(Bureau.bureau_id == bureau_id).first() if bureau_id else None
    if not bureau:
        raise IntakeError(f"Source bureau '{bureau_id}' does not exist")

    assigned = _clean(_get(data, "assigned_user_id"))
    if assigned and not db.query(User).filter(User.user_id == assigned).first():
        raise IntakeError(f"Assigned officer '{assigned}' does not exist")

    link = resolve_institution(db, data)
    inst: Institution = link["institution"]
    category = classify(db, description, _clean(_get(data, "category")))

    given_priority = (_clean(_get(data, "priority")) or "").upper()
    if given_priority and given_priority not in PRIORITIES:
        raise IntakeError(f"Unknown priority '{given_priority}'. Allowed: {', '.join(PRIORITIES)}")
    priority_hint = suggest_priority(description)
    priority = given_priority or priority_hint["priority"]

    now = datetime.now(timezone.utc)
    received_at = _aware(_get(data, "received_at")) or now
    if received_at > now:
        raise IntakeError("received_at cannot be in the future")

    complainant_name = _clean(_get(data, "complainant_name"))
    complainant_contact = _clean(_get(data, "complainant_contact"))
    duplicates = find_duplicates(db, inst, {
        "description": description, "category": category["value"],
        "complainant_name": complainant_name, "complainant_contact": complainant_contact,
        "received_at": received_at,
    })
    best_dup = duplicates[0] if duplicates else None

    case_id = next_case_id(db)
    case = Case(
        case_id=case_id,
        complaint_reference=next_complaint_reference(db, bureau.bureau_code),
        institution_id=inst.institution_id,
        source_bureau_id=bureau.bureau_id,
        current_bureau_id=bureau.bureau_id,
        assigned_user_id=assigned,
        category=category["value"],
        priority=priority,
        description=description,
        status="PENDING" if assigned else "RECEIVED",
        received_at=received_at,
        last_action_at=now,
        last_action_summary=f"Complaint registered via {channel.replace('_', ' ').lower()}",
        next_action="Initial scrutiny and verification",
        expected_disposal_at=calculate_expected_disposal_date(received_at, priority),
        complainant_name=complainant_name,
        complainant_contact=complainant_contact,
        intake_channel=channel,
        external_reference=_clean(_get(data, "external_reference")),
        raw_institution_name=link.get("raw_name"),
        institution_match_status=link["status"],
        institution_match_score=link["score"],
        category_source=category["source"],
        category_confidence=category.get("confidence"),
        duplicate_of_case_id=best_dup["case_id"] if best_dup else None,
        duplicate_score=best_dup["score"] if best_dup else None,
        created_at=now,
        updated_at=now,
    )
    db.add(case)
    db.flush()

    remarks = [f"Registered under {bureau.bureau_code} via {channel}"]
    if link["status"] != "CONFIRMED":
        remarks.append(f"institution {link['status'].replace('_', ' ').lower()} ({link['score']:.0f}%)")
    if category["source"] == "AUTO":
        remarks.append(f"category auto-suggested '{category['value']}' ({(category['confidence'] or 0) * 100:.0f}% confidence)")
    if not given_priority:
        remarks.append(f"priority suggested {priority} ({priority_hint['reason']})")
    db.add(CaseAction(case_id=case_id, action_type="REGISTERED", previous_status=None, new_status=case.status,
                      actor_user_id=actor_user_id, remarks="; ".join(remarks),
                      next_action=case.next_action, created_at=now))

    if best_dup:
        db.add(RelatedCase(source_case_id=case_id, related_case_id=best_dup["case_id"],
                           relationship_type="DUPLICATE_SUBMISSION", decision_status="PROPOSED",
                           reason=f"Possible duplicate ({best_dup['score']:.0f}%): " + ", ".join(best_dup["reasons"]),
                           created_by="SYSTEM", created_at=now))
        db.add(CaseAction(case_id=case_id, action_type="COORDINATION_NOTE", previous_status=None,
                          new_status=case.status, actor_user_id="SYSTEM",
                          remarks=f"Possible duplicate of {best_dup['case_id']} ({best_dup['bureau_id']}, score {best_dup['score']:.0f}%). "
                                  "Verify before issuing a separate notice.",
                          next_action="Confirm or dismiss duplicate link", created_at=now))
        for target_bureau in {bureau.bureau_id, best_dup["bureau_id"]}:
            db.add(Notification(bureau_id=target_bureau, alert_type="DUPLICATE_SUSPECTED", reference_id=case_id,
                                message=f"{case_id} looks like a repeat of {best_dup['case_id']} at {inst.canonical_name}"[:255],
                                created_at=now))

    record_audit_log(db=db, actor_user_id=actor_user_id, entity_type="CASE", entity_id=case_id, action="CREATE",
                     after={"case_id": case_id, "institution_id": inst.institution_id, "bureau": bureau.bureau_id,
                            "channel": channel, "match_status": link["status"],
                            "category_source": category["source"], "duplicate_of": case.duplicate_of_case_id})
    db.commit()
    db.refresh(case)

    overlap_alert_id = None
    if run_overlap_scan:
        scan_and_generate_overlap_alerts(db, institution_id=inst.institution_id)
        open_alert = db.query(OverlapAlert).filter(OverlapAlert.institution_id == inst.institution_id,
                                                   OverlapAlert.status.in_(OPEN_ALERT_STATUSES)).first()
        overlap_alert_id = open_alert.alert_id if open_alert else None

    return {
        "message": "Complaint case registered successfully",
        "case_id": case.case_id,
        "complaint_reference": case.complaint_reference,
        "expected_disposal_at": case.expected_disposal_at,
        "status": case.status,
        "institution": {"institution_id": inst.institution_id, "canonical_name": inst.canonical_name,
                        "match_status": link["status"], "score": link["score"], "method": link["method"],
                        "details": link["details"], "queue_id": link.get("queue_id")},
        "category": category,
        "priority": {"value": priority, "source": "MANUAL" if given_priority else "AUTO", "reason": priority_hint["reason"]},
        "duplicate": best_dup,
        "overlap_alert_id": overlap_alert_id,
    }


def set_duplicate_decision(db: Session, case_id: str, decision: str, actor_user_id: str) -> Dict[str, Any]:
    """Officer confirms or dismisses a system-proposed duplicate link."""
    decision = decision.upper()
    if decision not in ("CONFIRMED", "DISMISSED"):
        raise IntakeError("decision must be CONFIRMED or DISMISSED")
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case or not case.duplicate_of_case_id:
        raise IntakeError("Case has no proposed duplicate link")
    rel = db.query(RelatedCase).filter(RelatedCase.source_case_id == case_id,
                                       RelatedCase.related_case_id == case.duplicate_of_case_id).first()
    if rel:
        rel.decision_status = decision
    original = case.duplicate_of_case_id
    if decision == "DISMISSED":
        case.duplicate_of_case_id = None
        case.duplicate_score = None
    now = datetime.now(timezone.utc)
    db.add(CaseAction(case_id=case_id, action_type="LINKED" if decision == "CONFIRMED" else "COORDINATION_NOTE",
                      previous_status=None, new_status=case.status, actor_user_id=actor_user_id,
                      remarks=f"Duplicate link with {original} {decision.lower()} by officer", created_at=now))
    record_audit_log(db=db, actor_user_id=actor_user_id, entity_type="CASE", entity_id=case_id,
                     action=f"DUPLICATE_{decision}", after={"duplicate_of": original})
    db.commit()
    return {"case_id": case_id, "duplicate_of": original, "decision": decision}

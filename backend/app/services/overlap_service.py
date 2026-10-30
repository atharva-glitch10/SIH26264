import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.models.models import (
    Case, OverlapAlert, OverlapAlertCase, RelatedCase, CaseAction,
    Institution, Bureau, Notification
)
from backend.app.services.audit_service import record_audit_log
from backend.app.core.ids import next_overlap_alert_id

from backend.app.services.overlap_rules_engine import (  # noqa: E402
    SEVERITY_ORDER, OPEN_ALERT_STATUSES, DEFAULT_ACTIVE_STATUSES,
    categories_related, evaluate_institution_overlap,
)


def load_overlap_rules() -> Dict[str, Any]:
    if settings.OVERLAP_RULES_PATH.exists():
        with open(settings.OVERLAP_RULES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "active_statuses": DEFAULT_ACTIVE_STATUSES,
        "rules": {
            "rule_a_multi_bureau": {"enabled": True, "min_bureaus": 2, "min_cases": 2, "base_severity": "MEDIUM"},
            "rule_b_category_overlap": {"enabled": True, "category_clusters": [], "severity_boost": "HIGH"},
            "rule_c_description_similarity": {"enabled": True, "similarity_threshold": 70, "severity_boost": "CRITICAL"},
        },
    }


def scan_and_generate_overlap_alerts(db: Session, institution_id: Optional[str] = None) -> List[OverlapAlert]:
    """
    Scans active cases for cross-bureau overlap conditions (Rules A, B, C, D in SPEC.md).
    Can be run for a single institution or globally.
    """
    cfg = load_overlap_rules()
    rules = cfg.get("rules", {})
    active_statuses = tuple(cfg.get("active_statuses", DEFAULT_ACTIVE_STATUSES))

    query = db.query(Case).filter(Case.status.in_(active_statuses))
    if institution_id:
        query = query.filter(Case.institution_id == institution_id)

    inst_case_map: Dict[str, List[Case]] = {}
    for c in query.all():
        inst_case_map.setdefault(c.institution_id, []).append(c)

    generated_alerts: List[OverlapAlert] = []

    for i_id, cases in inst_case_map.items():
        inst = db.query(Institution).filter(Institution.institution_id == i_id).first()
        names = [inst.canonical_name] + [a.alias_name for a in inst.aliases] if inst else []
        result = evaluate_institution_overlap(cases, rules, names)
        if result is None:
            continue

        recommended_action = (
            "Convene an inter-bureau coordination meeting between "
            f"{', '.join(result['bureaus'])} officers, appoint a lead bureau, and align notices, "
            "document requests and inspection dates for this institution."
        )

        # Rule D: one open alert per institution + bureau set. If the bureau set grew,
        # the existing (subset) alert is expanded instead of creating a new one.
        open_alerts = db.query(OverlapAlert).filter(
            OverlapAlert.institution_id == i_id,
            OverlapAlert.status.in_(OPEN_ALERT_STATUSES),
        ).all()
        current_set = set(result["bureaus"])
        existing_alert = None
        for alert in open_alerts:
            key = set((alert.bureau_set_key or "").split("|")) - {""}
            if key == current_set:
                existing_alert = alert
                break
        if existing_alert is None:
            for alert in open_alerts:
                key = set((alert.bureau_set_key or "").split("|")) - {""}
                if not key or key.issubset(current_set):
                    existing_alert = alert
                    break

        if existing_alert:
            existing_case_ids = {link.case_id for link in existing_alert.alert_cases}
            for c in cases:
                if c.case_id not in existing_case_ids:
                    db.add(OverlapAlertCase(alert_id=existing_alert.alert_id, case_id=c.case_id))
            existing_alert.severity = result["severity"]
            existing_alert.explanation = result["explanation"]
            existing_alert.recommended_action = recommended_action
            existing_alert.bureau_set_key = result["bureau_set_key"]
            existing_alert.rules_triggered = result["rules_triggered"]
            db.commit()
            generated_alerts.append(existing_alert)
            continue

        alert = OverlapAlert(
            alert_id=next_overlap_alert_id(db),
            institution_id=i_id,
            alert_type="CROSS_BUREAU_CONCURRENT_CASES",
            severity=result["severity"],
            status="NEW",
            explanation=result["explanation"],
            recommended_action=recommended_action,
            bureau_set_key=result["bureau_set_key"],
            rules_triggered=result["rules_triggered"],
            created_at=datetime.now(timezone.utc),
        )
        db.add(alert)
        db.flush()
        for c in cases:
            db.add(OverlapAlertCase(alert_id=alert.alert_id, case_id=c.case_id))

        inst_label = inst.canonical_name if inst else i_id
        for bureau_id in result["bureaus"]:
            db.add(Notification(
                bureau_id=bureau_id,
                alert_type="OVERLAP_DETECTED",
                reference_id=alert.alert_id,
                message=f"Overlap ({result['severity']}): {inst_label} has active cases in {', '.join(result['bureaus'])}"[:255],
                created_at=datetime.now(timezone.utc),
            ))
        db.commit()
        db.refresh(alert)
        generated_alerts.append(alert)

    return generated_alerts

def review_overlap_alert(
    db: Session,
    alert_id: str,
    reviewer_id: str,
    remarks: Optional[str] = None
) -> OverlapAlert:
    alert = db.query(OverlapAlert).filter(OverlapAlert.alert_id == alert_id).first()
    if not alert:
        raise ValueError("Overlap alert not found")
        
    before = {"status": alert.status}
    alert.status = "COORDINATION_REQUIRED"
    alert.reviewed_by = reviewer_id
    alert.reviewed_at = datetime.now(timezone.utc)
    
    record_audit_log(
        db=db,
        actor_user_id=reviewer_id,
        entity_type="OVERLAP_ALERT",
        entity_id=alert_id,
        action="REVIEW",
        before=before,
        after={"status": alert.status, "remarks": remarks}
    )
    db.commit()
    db.refresh(alert)
    return alert

def link_overlap_cases(
    db: Session,
    alert_id: str,
    source_case_id: str,
    target_case_id: str,
    reason: str,
    actor_user_id: str,
    lead_bureau_id: Optional[str] = None
) -> RelatedCase:
    alert = db.query(OverlapAlert).filter(OverlapAlert.alert_id == alert_id).first()
    if not alert:
        raise ValueError("Overlap alert not found")
        
    # Check if relationship already exists
    existing = db.query(RelatedCase).filter(
        (
            (RelatedCase.source_case_id == source_case_id) & (RelatedCase.related_case_id == target_case_id)
        ) | (
            (RelatedCase.source_case_id == target_case_id) & (RelatedCase.related_case_id == source_case_id)
        )
    ).first()
    
    if not existing:
        rel = RelatedCase(
            source_case_id=source_case_id,
            related_case_id=target_case_id,
            relationship_type="CROSS_BUREAU_OVERLAP",
            decision_status="CONFIRMED",
            reason=reason,
            created_by=actor_user_id,
            created_at=datetime.now(timezone.utc)
        )
        db.add(rel)
    else:
        rel = existing
        rel.decision_status = "CONFIRMED"
        rel.reason = reason
        
    # Record case action on both cases
    for cid in (source_case_id, target_case_id):
        other_id = target_case_id if cid == source_case_id else source_case_id
        action = CaseAction(
            case_id=cid,
            action_type="LINKED",
            previous_status=None,
            new_status="UNDER_PROCESS",
            actor_user_id=actor_user_id,
            remarks=f"Cross-bureau case linkage confirmed with {other_id}. Reason: {reason}",
            next_action="Joint inter-bureau review and alignment",
            created_at=datetime.now(timezone.utc)
        )
        db.add(action)
        
    alert.status = "LINKED_ACKNOWLEDGED"
    if lead_bureau_id:
        alert.lead_bureau_id = lead_bureau_id
        
    record_audit_log(
        db=db,
        actor_user_id=actor_user_id,
        entity_type="OVERLAP_ALERT",
        entity_id=alert_id,
        action="LINK_CASES",
        before=None,
        after={"source_case": source_case_id, "target_case": target_case_id, "reason": reason}
    )
    
    db.commit()
    return rel

def resolve_overlap_alert(
    db: Session,
    alert_id: str,
    resolution_reason: str,
    actor_user_id: str,
    lead_bureau_id: Optional[str] = None
) -> OverlapAlert:
    alert = db.query(OverlapAlert).filter(OverlapAlert.alert_id == alert_id).first()
    if not alert:
        raise ValueError("Overlap alert not found")
        
    before = {"status": alert.status}
    alert.status = "RESOLVED"
    alert.resolution_reason = resolution_reason
    alert.resolved_at = datetime.now(timezone.utc)
    if lead_bureau_id:
        alert.lead_bureau_id = lead_bureau_id
        
    # Add coordination note action to participating cases
    for link in alert.alert_cases:
        action = CaseAction(
            case_id=link.case_id,
            action_type="COORDINATION_NOTE",
            previous_status=None,
            new_status="UNDER_PROCESS",
            actor_user_id=actor_user_id,
            remarks=f"Overlap alert {alert_id} resolved. Resolution: {resolution_reason}",
            next_action="Proceed according to joint bureau resolution guidelines",
            created_at=datetime.now(timezone.utc)
        )
        db.add(action)
        
    record_audit_log(
        db=db,
        actor_user_id=actor_user_id,
        entity_type="OVERLAP_ALERT",
        entity_id=alert_id,
        action="RESOLVE",
        before=before,
        after={"status": "RESOLVED", "resolution_reason": resolution_reason}
    )
    db.commit()
    db.refresh(alert)
    return alert

def dismiss_overlap_alert(
    db: Session,
    alert_id: str,
    justification: str,
    actor_user_id: str
) -> OverlapAlert:
    alert = db.query(OverlapAlert).filter(OverlapAlert.alert_id == alert_id).first()
    if not alert:
        raise ValueError("Overlap alert not found")
    if not justification or not justification.strip():
        raise ValueError("Dismissing an overlap alert requires a clear mandatory justification")
        
    before = {"status": alert.status}
    alert.status = "DISMISSED"
    alert.resolution_reason = justification.strip()
    alert.resolved_at = datetime.now(timezone.utc)
    
    record_audit_log(
        db=db,
        actor_user_id=actor_user_id,
        entity_type="OVERLAP_ALERT",
        entity_id=alert_id,
        action="DISMISS",
        before=before,
        after={"status": "DISMISSED", "justification": justification}
    )
    db.commit()
    db.refresh(alert)
    return alert

import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from rapidfuzz import fuzz

from backend.app.core.config import settings
from backend.app.models.models import (
    Case, OverlapAlert, OverlapAlertCase, RelatedCase, CaseAction,
    Institution, Bureau, Notification
)
from backend.app.services.audit_service import record_audit_log

def load_overlap_rules() -> Dict[str, Any]:
    if settings.OVERLAP_RULES_PATH.exists():
        with open(settings.OVERLAP_RULES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "active_statuses": ["RECEIVED", "PENDING", "UNDER_PROCESS", "ESCALATED", "TRANSFERRED"],
        "rules": {
            "rule_a_multi_bureau": {"enabled": True, "base_severity": "MEDIUM"},
            "rule_b_category_overlap": {"enabled": True, "severity_boost": "HIGH"},
            "rule_c_description_similarity": {"enabled": True, "similarity_threshold": 75}
        }
    }

def scan_and_generate_overlap_alerts(db: Session, institution_id: Optional[str] = None) -> List[OverlapAlert]:
    """
    Scans active cases for cross-bureau overlap conditions.
    Can be run for a single institution or globally.
    """
    cfg = load_overlap_rules()
    active_statuses = tuple(cfg.get("active_statuses", ["RECEIVED", "PENDING", "UNDER_PROCESS", "ESCALATED", "TRANSFERRED"]))
    
    query = db.query(Case).filter(Case.status.in_(active_statuses))
    if institution_id:
        query = query.filter(Case.institution_id == institution_id)
        
    all_active_cases = query.all()
    
    # Group cases by institution
    inst_case_map: Dict[str, List[Case]] = {}
    for c in all_active_cases:
        inst_case_map.setdefault(c.institution_id, []).append(c)
        
    generated_alerts: List[OverlapAlert] = []
    
    for i_id, cases in inst_case_map.items():
        # Check distinct active bureaus handling these cases
        bureaus_involved = set(c.current_bureau_id for c in cases)
        if len(bureaus_involved) < 2 or len(cases) < 2:
            continue
            
        # Check if an unresolved alert already exists for this institution
        existing_alert = db.query(OverlapAlert).filter(
            OverlapAlert.institution_id == i_id,
            OverlapAlert.status.in_(["NEW", "UNDER_REVIEW", "COORDINATION_REQUIRED", "LINKED_ACKNOWLEDGED"])
        ).first()
        
        # Analyze category clusters & similarity
        categories = [c.category for c in cases]
        has_common_category = len(set(categories)) < len(categories)
        
        # Check text similarity between descriptions
        max_sim = 0.0
        desc_matches = []
        for i in range(len(cases)):
            for j in range(i + 1, len(cases)):
                sim = fuzz.token_set_ratio(cases[i].description, cases[j].description)
                if sim > max_sim:
                    max_sim = sim
                if sim >= 75:
                    desc_matches.append((cases[i].case_id, cases[j].case_id, sim))
                    
        # Determine Severity & Recommended Action
        severity = "MEDIUM"
        if has_common_category:
            severity = "HIGH"
        if max_sim >= 75:
            severity = "CRITICAL"
            
        bureau_names = [c.current_bureau_id for c in cases]
        explanation = (
            f"Cross-bureau coordination signal: Institution has {len(cases)} active cases "
            f"across {len(bureaus_involved)} Bureaus/Cells ({', '.join(sorted(bureaus_involved))})."
        )
        if has_common_category:
            explanation += f" Matching/related categories detected ({', '.join(set(categories))})."
        if max_sim >= 75:
            explanation += f" High textual description similarity ({max_sim:.1f}%) observed."

        recommended_action = (
            "Convene inter-bureau coordination meeting between "
            f"{', '.join(sorted(bureaus_involved))} officers. Appoint lead bureau to harmonize inspections and hearings."
        )

        if existing_alert:
            # Update cases attached to existing alert if any new cases arrived
            existing_case_ids = {link.case_id for link in existing_alert.alert_cases}
            for c in cases:
                if c.case_id not in existing_case_ids:
                    db.add(OverlapAlertCase(alert_id=existing_alert.alert_id, case_id=c.case_id))
            # Update explanation and severity if escalated
            if severity in ("HIGH", "CRITICAL") and existing_alert.severity != "CRITICAL":
                existing_alert.severity = severity
            existing_alert.explanation = explanation
            db.commit()
            generated_alerts.append(existing_alert)
        else:
            # Create new OverlapAlert
            # Format: OVR-{YYYY}-{count+1:04d}
            count = db.query(OverlapAlert).count()
            alert_id = f"OVR-2026-{count + 1:04d}"
            
            alert = OverlapAlert(
                alert_id=alert_id,
                institution_id=i_id,
                alert_type="CROSS_BUREAU_CONCURRENT_CASES",
                severity=severity,
                status="NEW",
                explanation=explanation,
                recommended_action=recommended_action,
                created_at=datetime.now(timezone.utc)
            )
            db.add(alert)
            db.flush()
            
            for c in cases:
                db.add(OverlapAlertCase(alert_id=alert.alert_id, case_id=c.case_id))
                
            # Create in-app notification
            notif = Notification(
                alert_type="OVERLAP_DETECTED",
                reference_id=alert.alert_id,
                message=f"Potential Overlapping Cases ({severity}) flagged for institution {i_id}",
                created_at=datetime.now(timezone.utc)
            )
            db.add(notif)
            
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

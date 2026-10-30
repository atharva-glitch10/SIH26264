import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.models.models import Case, CaseAction, Bureau, User, Notification
from backend.app.services.audit_service import record_audit_log

def load_workflow_rules() -> Dict[str, Any]:
    if settings.WORKFLOW_RULES_PATH.exists():
        with open(settings.WORKFLOW_RULES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "allowed_transitions": {
            "RECEIVED": ["PENDING", "UNDER_PROCESS", "TRANSFERRED"],
            "PENDING": ["UNDER_PROCESS", "TRANSFERRED", "ESCALATED"],
            "UNDER_PROCESS": ["TRANSFERRED", "ESCALATED", "DISPOSED"],
            "TRANSFERRED": ["PENDING", "UNDER_PROCESS", "ESCALATED"],
            "ESCALATED": ["UNDER_PROCESS", "DISPOSED"],
            "DISPOSED": ["CLOSED", "UNDER_PROCESS"],
            "CLOSED": []
        }
    }

def validate_transition(current_status: str, target_status: str):
    rules = load_workflow_rules()
    allowed = rules.get("allowed_transitions", {}).get(current_status, [])
    if target_status not in allowed:
        raise ValueError(
            f"Invalid workflow status transition from '{current_status}' to '{target_status}'. "
            f"Allowed transitions are: {', '.join(allowed) if allowed else 'None'}"
        )

def assign_case(
    db: Session,
    case_id: str,
    assigned_user_id: str,
    remarks: str,
    actor_user_id: str
) -> Case:
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise ValueError("Case not found")
        
    user = db.query(User).filter(User.user_id == assigned_user_id).first()
    if not user:
        raise ValueError(f"Target officer {assigned_user_id} not found")
        
    before = {
        "assigned_user_id": case.assigned_user_id,
        "status": case.status
    }
    
    prev_status = case.status
    if case.status == "RECEIVED":
        validate_transition(case.status, "PENDING")
        case.status = "PENDING"
        
    case.assigned_user_id = assigned_user_id
    case.last_action_at = datetime.now(timezone.utc)
    case.last_action_summary = f"Assigned to {user.display_name} ({user.role})"
    case.next_action = "Initial preliminary assessment and notice drafting"
    
    action = CaseAction(
        case_id=case_id,
        action_type="ASSIGNED",
        previous_status=prev_status,
        new_status=case.status,
        actor_user_id=actor_user_id,
        remarks=remarks,
        next_action=case.next_action,
        created_at=datetime.now(timezone.utc)
    )
    db.add(action)
    
    record_audit_log(
        db=db,
        actor_user_id=actor_user_id,
        entity_type="CASE",
        entity_id=case_id,
        action="ASSIGN",
        before=before,
        after={"assigned_user_id": assigned_user_id, "status": case.status}
    )
    
    db.commit()
    db.refresh(case)
    return case

def transfer_case(
    db: Session,
    case_id: str,
    destination_bureau_id: str,
    reason: str,
    actor_user_id: str
) -> Case:
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise ValueError("Case not found")
        
    dest_bureau = db.query(Bureau).filter(Bureau.bureau_id == destination_bureau_id).first()
    if not dest_bureau:
        raise ValueError(f"Destination bureau {destination_bureau_id} not found")
        
    if case.current_bureau_id == destination_bureau_id:
        raise ValueError("Case is already assigned to this Bureau")
        
    if not reason or not reason.strip():
        raise ValueError("Transfer requires a mandatory rationale/reason")
        
    validate_transition(case.status, "TRANSFERRED")
    
    before = {
        "current_bureau_id": case.current_bureau_id,
        "status": case.status,
        "assigned_user_id": case.assigned_user_id
    }
    
    prev_bureau_id = case.current_bureau_id
    prev_status = case.status
    
    case.current_bureau_id = destination_bureau_id
    case.assigned_user_id = None  # Clear assigned user on inter-bureau transfer
    case.status = "TRANSFERRED"
    case.last_action_at = datetime.now(timezone.utc)
    case.last_action_summary = f"Transferred to {dest_bureau.bureau_name} ({dest_bureau.bureau_code})"
    case.next_action = f"Acknowledgment and reassignment by {dest_bureau.bureau_code} Bureau Head"
    
    action = CaseAction(
        case_id=case_id,
        action_type="TRANSFERRED",
        previous_status=prev_status,
        new_status="TRANSFERRED",
        previous_bureau_id=prev_bureau_id,
        new_bureau_id=destination_bureau_id,
        actor_user_id=actor_user_id,
        remarks=reason,
        next_action=case.next_action,
        created_at=datetime.now(timezone.utc)
    )
    db.add(action)
    
    # Send notification to receiving bureau
    notif = Notification(
        bureau_id=destination_bureau_id,
        alert_type="TRANSFER_RECEIVED",
        reference_id=case_id,
        message=f"Case {case_id} transferred from {prev_bureau_id} to {destination_bureau_id}",
        created_at=datetime.now(timezone.utc)
    )
    db.add(notif)
    
    record_audit_log(
        db=db,
        actor_user_id=actor_user_id,
        entity_type="CASE",
        entity_id=case_id,
        action="TRANSFER",
        before=before,
        after={"current_bureau_id": destination_bureau_id, "status": "TRANSFERRED", "reason": reason}
    )
    
    db.commit()
    db.refresh(case)
    return case

def escalate_case(
    db: Session,
    case_id: str,
    reason: str,
    actor_user_id: str
) -> Case:
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise ValueError("Case not found")
        
    if not reason or not reason.strip():
        raise ValueError("Escalation requires a mandatory justification")
        
    validate_transition(case.status, "ESCALATED")
    
    before = {
        "status": case.status,
        "priority": case.priority
    }
    prev_status = case.status
    
    case.status = "ESCALATED"
    case.priority = "URGENT"
    case.last_action_at = datetime.now(timezone.utc)
    case.last_action_summary = f"Case escalated to Senior Management: {reason}"
    case.next_action = "Appellate review / Member Secretary directives"
    
    action = CaseAction(
        case_id=case_id,
        action_type="ESCALATED",
        previous_status=prev_status,
        new_status="ESCALATED",
        actor_user_id=actor_user_id,
        remarks=reason,
        next_action=case.next_action,
        created_at=datetime.now(timezone.utc)
    )
    db.add(action)
    
    # Send notification
    notif = Notification(
        alert_type="ESCALATION",
        reference_id=case_id,
        message=f"Case {case_id} escalated to Senior Management: {reason[:100]}",
        created_at=datetime.now(timezone.utc)
    )
    db.add(notif)
    
    record_audit_log(
        db=db,
        actor_user_id=actor_user_id,
        entity_type="CASE",
        entity_id=case_id,
        action="ESCALATE",
        before=before,
        after={"status": "ESCALATED", "priority": "URGENT", "reason": reason}
    )
    
    db.commit()
    db.refresh(case)
    return case

def dispose_case(
    db: Session,
    case_id: str,
    disposal_summary: str,
    resolution_type: str,
    actor_user_id: str
) -> Case:
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise ValueError("Case not found")
        
    if not disposal_summary or not disposal_summary.strip():
        raise ValueError("Disposal requires a mandatory resolution summary")
        
    validate_transition(case.status, "DISPOSED")
    
    now = datetime.now(timezone.utc)
    before = {
        "status": case.status,
        "actual_disposal_at": case.actual_disposal_at
    }
    prev_status = case.status
    
    case.status = "DISPOSED"
    case.actual_disposal_at = now
    case.last_action_at = now
    case.last_action_summary = f"Disposed: {disposal_summary}"
    case.next_action = "Archived / Formal closure pending appeal window"
    
    action = CaseAction(
        case_id=case_id,
        action_type="DISPOSED",
        previous_status=prev_status,
        new_status="DISPOSED",
        actor_user_id=actor_user_id,
        remarks=f"[{resolution_type}] {disposal_summary}",
        next_action=case.next_action,
        created_at=now
    )
    db.add(action)
    
    record_audit_log(
        db=db,
        actor_user_id=actor_user_id,
        entity_type="CASE",
        entity_id=case_id,
        action="DISPOSE",
        before=before,
        after={"status": "DISPOSED", "actual_disposal_at": now.isoformat(), "summary": disposal_summary}
    )
    
    db.commit()
    db.refresh(case)
    return case


def close_case(db: Session, case_id: str, actor_user_id: str) -> Case:
    """Formal closure of a disposed case (DISPOSED -> CLOSED)."""
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise ValueError("Case not found")
    validate_transition(case.status, "CLOSED")
    now = datetime.now(timezone.utc)
    prev_status = case.status
    case.status = "CLOSED"
    case.last_action_at = now
    case.last_action_summary = "Case formally closed"
    case.next_action = None
    db.add(CaseAction(case_id=case_id, action_type="STATUS_CHANGE", previous_status=prev_status,
                      new_status="CLOSED", actor_user_id=actor_user_id,
                      remarks="Formal closure after disposal", created_at=now))
    record_audit_log(db=db, actor_user_id=actor_user_id, entity_type="CASE", entity_id=case_id,
                     action="CLOSE", before={"status": prev_status}, after={"status": "CLOSED"})
    db.commit()
    db.refresh(case)
    return case

import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from backend.app.models.models import (
    Case, CaseAction, RelatedCase, Institution, Bureau, User, OverlapAlertCase, OverlapAlert
)
from backend.app.schemas.schemas import CaseCreate, CaseUpdate
from backend.app.services.sla_service import calculate_expected_disposal_date, evaluate_case_sla
from backend.app.services.audit_service import record_audit_log
from backend.app.services.overlap_service import scan_and_generate_overlap_alerts

def list_cases(
    db: Session,
    search: Optional[str] = None,
    bureau_id: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
    overdue_only: Optional[bool] = None,
    page: int = 1,
    page_size: int = 20
) -> Dict[str, Any]:
    query = db.query(Case).join(Institution, Case.institution_id == Institution.institution_id)
    
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Case.case_id.ilike(term),
                Case.complaint_reference.ilike(term),
                Case.description.ilike(term),
                Institution.canonical_name.ilike(term),
                Institution.aicte_permanent_id.ilike(term)
            )
        )
        
    if bureau_id and bureau_id != "ALL":
        query = query.filter(Case.current_bureau_id == bureau_id)
        
    if status and status != "ALL":
        query = query.filter(Case.status == status)
        
    if priority and priority != "ALL":
        query = query.filter(Case.priority == priority)
        
    if category and category != "ALL":
        query = query.filter(Case.category == category)
        
    if region and region != "ALL":
        query = query.filter(Institution.region == region)
        
    all_filtered = query.order_by(Case.received_at.desc()).all()
    
    # Process SLA calculations
    processed_items = []
    for c in all_filtered:
        sla_info = evaluate_case_sla(c.received_at, c.expected_disposal_at, c.status, c.actual_disposal_at)
        if overdue_only and not sla_info["is_overdue"]:
            continue
            
        bureau = db.query(Bureau).filter(Bureau.bureau_id == c.current_bureau_id).first()
        user = db.query(User).filter(User.user_id == c.assigned_user_id).first() if c.assigned_user_id else None
        inst = c.institution
        
        item = {
            "case_id": c.case_id,
            "complaint_reference": c.complaint_reference,
            "institution_id": c.institution_id,
            "institution_name": inst.canonical_name if inst else "Unknown",
            "source_bureau_id": c.source_bureau_id,
            "current_bureau_id": c.current_bureau_id,
            "current_bureau_name": bureau.bureau_name if bureau else c.current_bureau_id,
            "assigned_user_id": c.assigned_user_id,
            "assigned_user_name": user.display_name if user else "Unassigned",
            "category": c.category,
            "priority": c.priority,
            "description": c.description,
            "status": c.status,
            "received_at": c.received_at,
            "last_action_at": c.last_action_at,
            "last_action_summary": c.last_action_summary,
            "next_action": c.next_action,
            "expected_disposal_at": c.expected_disposal_at,
            "actual_disposal_at": c.actual_disposal_at,
            "days_pending": sla_info["days_pending"],
            "is_overdue": sla_info["is_overdue"],
            "sla_status": sla_info["sla_status"],
            "created_at": c.created_at,
            "updated_at": c.updated_at
        }
        processed_items.append(item)
        
    total = len(processed_items)
    start_idx = (page - 1) * page_size
    paged_items = processed_items[start_idx : start_idx + page_size]
    total_pages = max(1, (total + page_size - 1) // page_size)
    
    return {
        "items": paged_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

def get_case_detail(db: Session, case_id: str) -> Dict[str, Any]:
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise ValueError("Case not found")
        
    sla_info = evaluate_case_sla(case.received_at, case.expected_disposal_at, case.status, case.actual_disposal_at)
    bureau = db.query(Bureau).filter(Bureau.bureau_id == case.current_bureau_id).first()
    user = db.query(User).filter(User.user_id == case.assigned_user_id).first() if case.assigned_user_id else None
    inst = case.institution
    
    # Chronological actions
    actions = db.query(CaseAction).filter(CaseAction.case_id == case_id).order_by(CaseAction.created_at.desc()).all()
    action_items = [
        {
            "action_id": a.action_id,
            "case_id": a.case_id,
            "action_type": a.action_type,
            "previous_status": a.previous_status,
            "new_status": a.new_status,
            "previous_bureau_id": a.previous_bureau_id,
            "new_bureau_id": a.new_bureau_id,
            "actor_user_id": a.actor_user_id,
            "remarks": a.remarks,
            "next_action": a.next_action,
            "created_at": a.created_at
        }
        for a in actions
    ]
    
    # Related cases
    related = db.query(RelatedCase).filter(
        or_(RelatedCase.source_case_id == case_id, RelatedCase.related_case_id == case_id)
    ).all()
    
    related_items = []
    for r in related:
        other_id = r.related_case_id if r.source_case_id == case_id else r.source_case_id
        other_case = db.query(Case).filter(Case.case_id == other_id).first()
        other_case_dict = None
        if other_case:
            other_sla = evaluate_case_sla(other_case.received_at, other_case.expected_disposal_at, other_case.status, other_case.actual_disposal_at)
            other_case_dict = {
                "case_id": other_case.case_id,
                "complaint_reference": other_case.complaint_reference,
                "institution_id": other_case.institution_id,
                "institution_name": other_case.institution.canonical_name if other_case.institution else "Unknown",
                "source_bureau_id": other_case.source_bureau_id,
                "current_bureau_id": other_case.current_bureau_id,
                "category": other_case.category,
                "priority": other_case.priority,
                "description": other_case.description,
                "status": other_case.status,
                "received_at": other_case.received_at,
                "last_action_at": other_case.last_action_at,
                "expected_disposal_at": other_case.expected_disposal_at,
                "actual_disposal_at": other_case.actual_disposal_at,
                "days_pending": other_sla["days_pending"],
                "is_overdue": other_sla["is_overdue"],
                "sla_status": other_sla["sla_status"],
                "created_at": other_case.created_at,
                "updated_at": other_case.updated_at
            }
        related_items.append({
            "relationship_id": r.relationship_id,
            "source_case_id": r.source_case_id,
            "related_case_id": r.related_case_id,
            "relationship_type": r.relationship_type,
            "decision_status": r.decision_status,
            "reason": r.reason,
            "created_by": r.created_by,
            "created_at": r.created_at,
            "related_case": other_case_dict
        })
        
    # Active Overlap Alert link
    active_overlap = db.query(OverlapAlertCase).join(OverlapAlert).filter(
        OverlapAlertCase.case_id == case_id,
        OverlapAlert.status.in_(["NEW", "UNDER_REVIEW", "COORDINATION_REQUIRED", "LINKED_ACKNOWLEDGED"])
    ).first()
    
    return {
        "case_id": case.case_id,
        "complaint_reference": case.complaint_reference,
        "institution_id": case.institution_id,
        "institution_name": inst.canonical_name if inst else "Unknown",
        "source_bureau_id": case.source_bureau_id,
        "current_bureau_id": case.current_bureau_id,
        "current_bureau_name": bureau.bureau_name if bureau else case.current_bureau_id,
        "assigned_user_id": case.assigned_user_id,
        "assigned_user_name": user.display_name if user else "Unassigned",
        "category": case.category,
        "priority": case.priority,
        "description": case.description,
        "status": case.status,
        "received_at": case.received_at,
        "last_action_at": case.last_action_at,
        "last_action_summary": case.last_action_summary,
        "next_action": case.next_action,
        "expected_disposal_at": case.expected_disposal_at,
        "actual_disposal_at": case.actual_disposal_at,
        "days_pending": sla_info["days_pending"],
        "is_overdue": sla_info["is_overdue"],
        "sla_status": sla_info["sla_status"],
        "created_at": case.created_at,
        "updated_at": case.updated_at,
        "actions": action_items,
        "related_cases": related_items,
        "active_overlap_alert_id": active_overlap.alert_id if active_overlap else None
    }

def create_case(db: Session, data: CaseCreate, actor_user_id: str = "USR-SYS-01") -> Case:
    inst = db.query(Institution).filter(Institution.institution_id == data.institution_id).first()
    if not inst:
        raise ValueError("Institution ID does not exist")
        
    bureau = db.query(Bureau).filter(Bureau.bureau_id == data.source_bureau_id).first()
    if not bureau:
        raise ValueError("Source Bureau ID does not exist")
        
    now = datetime.now(timezone.utc)
    count = db.query(Case).count()
    case_id = f"CASE-2026-{count + 1:05d}"
    complaint_ref = f"AICTE/{bureau.bureau_code}/2026/{count + 1:04d}"
    
    expected_disposal = calculate_expected_disposal_date(now, data.priority)
    
    case = Case(
        case_id=case_id,
        complaint_reference=complaint_ref,
        institution_id=data.institution_id,
        source_bureau_id=data.source_bureau_id,
        current_bureau_id=data.source_bureau_id,
        assigned_user_id=data.assigned_user_id,
        category=data.category,
        priority=data.priority,
        description=data.description,
        status="RECEIVED",
        received_at=now,
        last_action_at=now,
        last_action_summary="Complaint registered in system",
        next_action="Initial scrutiny and verification",
        expected_disposal_at=expected_disposal,
        created_at=now,
        updated_at=now
    )
    db.add(case)
    db.flush()
    
    action = CaseAction(
        case_id=case_id,
        action_type="REGISTERED",
        previous_status=None,
        new_status="RECEIVED",
        actor_user_id=actor_user_id,
        remarks=f"Registered complaint under {bureau.bureau_code} with category '{data.category}'",
        next_action=case.next_action,
        created_at=now
    )
    db.add(action)
    
    record_audit_log(
        db=db,
        actor_user_id=actor_user_id,
        entity_type="CASE",
        entity_id=case_id,
        action="CREATE",
        before=None,
        after={"case_id": case_id, "institution_id": data.institution_id, "bureau": data.source_bureau_id}
    )
    
    db.commit()
    db.refresh(case)
    
    # Automatically scan for potential cross-bureau overlap with this new case!
    scan_and_generate_overlap_alerts(db, institution_id=data.institution_id)
    
    return case

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from backend.app.core.database import get_db
from backend.app.models.models import Case, CaseAction
from backend.app.schemas.schemas import (
    CaseCreate, CaseUpdate, CaseAssignRequest, CaseTransferRequest,
    CaseEscalateRequest, CaseDisposeRequest, CaseActionCreate, CaseActionOut
)
from backend.app.services.complaint_service import list_cases, get_case_detail, create_case
from backend.app.services.workflow_service import assign_case, transfer_case, escalate_case, dispose_case
from backend.app.services.audit_service import record_audit_log

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.get("")
def get_all_cases(
    search: Optional[str] = Query(None, description="Search by case ID, ref, institution, keyword"),
    bureau_id: Optional[str] = Query(None, description="Bureau ID filter"),
    status: Optional[str] = Query(None, description="Status filter"),
    priority: Optional[str] = Query(None, description="Priority filter"),
    category: Optional[str] = Query(None, description="Category filter"),
    region: Optional[str] = Query(None, description="Region filter"),
    overdue_only: Optional[bool] = Query(None, description="Only overdue cases"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return list_cases(
        db=db,
        search=search,
        bureau_id=bureau_id,
        status=status,
        priority=priority,
        category=category,
        region=region,
        overdue_only=overdue_only,
        page=page,
        page_size=page_size
    )

@router.post("", status_code=201)
def register_case(data: CaseCreate, actor_user_id: Optional[str] = "USR-SYS-01", db: Session = Depends(get_db)):
    try:
        new_case = create_case(db=db, data=data, actor_user_id=actor_user_id)
        return {
            "message": "Complaint case registered successfully",
            "case_id": new_case.case_id,
            "complaint_reference": new_case.complaint_reference,
            "expected_disposal_at": new_case.expected_disposal_at
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{case_id}")
def get_case(case_id: str, db: Session = Depends(get_db)):
    try:
        return get_case_detail(db, case_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("/{case_id}")
def update_case(
    case_id: str,
    data: CaseUpdate,
    actor_user_id: Optional[str] = "USR-SYS-01",
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    before = {"category": case.category, "priority": case.priority, "next_action": case.next_action}
    update_data = data.model_dump(exclude_unset=True)
    
    for key, val in update_data.items():
        setattr(case, key, val)
        
    record_audit_log(
        db=db,
        actor_user_id=actor_user_id,
        entity_type="CASE",
        entity_id=case_id,
        action="UPDATE",
        before=before,
        after=update_data
    )
    db.commit()
    return {"message": "Case updated successfully"}

@router.post("/{case_id}/assign")
def assign_officer(case_id: str, data: CaseAssignRequest, db: Session = Depends(get_db)):
    try:
        updated = assign_case(
            db=db,
            case_id=case_id,
            assigned_user_id=data.assigned_user_id,
            remarks=data.remarks,
            actor_user_id=data.actor_user_id or "USR-SYS-01"
        )
        return {"message": f"Case assigned to {data.assigned_user_id}", "status": updated.status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{case_id}/transfer")
def transfer_bureau(case_id: str, data: CaseTransferRequest, db: Session = Depends(get_db)):
    try:
        updated = transfer_case(
            db=db,
            case_id=case_id,
            destination_bureau_id=data.destination_bureau_id,
            reason=data.reason,
            actor_user_id=data.actor_user_id or "USR-SYS-01"
        )
        return {
            "message": f"Case transferred to {data.destination_bureau_id}",
            "current_bureau_id": updated.current_bureau_id,
            "status": updated.status
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{case_id}/escalate")
def escalate_to_management(case_id: str, data: CaseEscalateRequest, db: Session = Depends(get_db)):
    try:
        updated = escalate_case(
            db=db,
            case_id=case_id,
            reason=data.reason,
            actor_user_id=data.actor_user_id or "USR-SYS-01"
        )
        return {"message": "Case escalated to Senior Management", "priority": updated.priority, "status": updated.status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{case_id}/dispose")
def dispose_complaint(case_id: str, data: CaseDisposeRequest, db: Session = Depends(get_db)):
    try:
        updated = dispose_case(
            db=db,
            case_id=case_id,
            disposal_summary=data.disposal_summary,
            resolution_type=data.resolution_type,
            actor_user_id=data.actor_user_id or "USR-SYS-01"
        )
        return {
            "message": "Case marked as DISPOSED with recorded action",
            "actual_disposal_at": updated.actual_disposal_at,
            "status": updated.status
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{case_id}/actions", response_model=List[CaseActionOut])
def get_case_actions(case_id: str, db: Session = Depends(get_db)):
    return db.query(CaseAction).filter(CaseAction.case_id == case_id).order_by(CaseAction.created_at.desc()).all()

@router.post("/{case_id}/actions", status_code=201)
def add_case_action(case_id: str, data: CaseActionCreate, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    action = CaseAction(
        case_id=case_id,
        action_type=data.action_type,
        previous_status=case.status,
        new_status=case.status,
        actor_user_id=data.actor_user_id or "USR-SYS-01",
        remarks=data.remarks,
        next_action=data.next_action,
        created_at=datetime.now()
    )
    db.add(action)
    if data.next_action:
        case.next_action = data.next_action
    case.last_action_summary = data.remarks[:100]
    db.commit()
    db.refresh(action)
    return action

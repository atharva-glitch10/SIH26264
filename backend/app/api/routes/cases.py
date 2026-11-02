from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.api.deps import ensure_can_act_on_case, ensure_can_register, get_current_user
from backend.app.core.database import get_db
from backend.app.models.models import Case, CaseAction
from backend.app.schemas.schemas import (
    CaseActionCreate, CaseActionOut, CaseAssignRequest, CaseDisposeRequest, CaseEscalateRequest,
    CaseTransferRequest, CaseUpdate, DuplicateDecisionRequest, IntakeRequest,
)
from backend.app.services.audit_service import record_audit_log
from backend.app.services.complaint_service import get_case_detail, list_cases
from backend.app.services.intake_service import (
    IntakeError, invalidate_classifier, process_intake, set_duplicate_decision,
)
from backend.app.services.nlp_seed import CATEGORIES
from backend.app.services.workflow_service import (
    assign_case, close_case, dispose_case, escalate_case, transfer_case,
)

router = APIRouter(prefix="/cases", tags=["Cases"])


def _load_case(db: Session, case_id: str) -> Case:
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.get("")
def get_all_cases(
    search: Optional[str] = Query(None, description="Search by case ID, ref, institution, keyword"),
    bureau_id: Optional[str] = Query(None, description="Bureau ID filter"),
    status: Optional[str] = Query(None, description="Status filter"),
    priority: Optional[str] = Query(None, description="Priority filter"),
    category: Optional[str] = Query(None, description="Category filter"),
    region: Optional[str] = Query(None, description="Region filter"),
    overdue_only: Optional[bool] = Query(None, description="Only overdue cases"),
    institution_id: Optional[str] = Query(None, description="Institution filter"),
    flag: Optional[str] = Query(None, description="DUPLICATE, PENDING_MATCH or AUTO_CATEGORY"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return list_cases(
        db=db, search=search, bureau_id=bureau_id, status=status, priority=priority, category=category,
        region=region, overdue_only=overdue_only, page=page, page_size=page_size,
        institution_id=institution_id, flag=flag,
    )


@router.post("", status_code=201)
def register_case(data: IntakeRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Register a complaint through the smart intake pipeline (auto-link, classify, dedupe, overlap scan)."""
    ensure_can_register(user, data.source_bureau_id)
    try:
        return process_intake(db, data, actor_user_id=user.user_id, channel="MANUAL")
    except IntakeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{case_id}")
def get_case(case_id: str, db: Session = Depends(get_db)):
    try:
        return get_case_detail(db, case_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{case_id}")
def update_case(case_id: str, data: CaseUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    case = _load_case(db, case_id)
    ensure_can_act_on_case(user, case)
    update_data = data.model_dump(exclude_unset=True)
    if "category" in update_data and update_data["category"] not in CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Unknown category. Allowed: {', '.join(CATEGORIES)}")
    if "priority" in update_data and update_data["priority"] not in ("LOW", "MEDIUM", "HIGH", "URGENT"):
        raise HTTPException(status_code=400, detail="Unknown priority")

    before = {"category": case.category, "category_source": case.category_source,
              "priority": case.priority, "next_action": case.next_action}
    for key, val in update_data.items():
        setattr(case, key, val)
    if "category" in update_data:
        # An officer-confirmed category becomes training data for the classifier.
        case.category_source = "MANUAL"
        case.category_confidence = None
        invalidate_classifier()
    case.updated_at = datetime.now(timezone.utc)
    record_audit_log(db=db, actor_user_id=user.user_id, entity_type="CASE", entity_id=case_id,
                     action="UPDATE", before=before, after=update_data)
    db.commit()
    return {"message": "Case updated successfully"}


@router.post("/{case_id}/assign")
def assign_officer(case_id: str, data: CaseAssignRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ensure_can_act_on_case(user, _load_case(db, case_id))
    try:
        updated = assign_case(db=db, case_id=case_id, assigned_user_id=data.assigned_user_id,
                              remarks=data.remarks, actor_user_id=user.user_id)
        return {"message": f"Case assigned to {data.assigned_user_id}", "status": updated.status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{case_id}/transfer")
def transfer_bureau(case_id: str, data: CaseTransferRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ensure_can_act_on_case(user, _load_case(db, case_id))
    try:
        updated = transfer_case(db=db, case_id=case_id, destination_bureau_id=data.destination_bureau_id,
                                reason=data.reason, actor_user_id=user.user_id)
        return {"message": f"Case transferred to {data.destination_bureau_id}",
                "current_bureau_id": updated.current_bureau_id, "status": updated.status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{case_id}/escalate")
def escalate_to_management(case_id: str, data: CaseEscalateRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ensure_can_act_on_case(user, _load_case(db, case_id))
    try:
        updated = escalate_case(db=db, case_id=case_id, reason=data.reason, actor_user_id=user.user_id)
        return {"message": "Case escalated to Senior Management", "priority": updated.priority, "status": updated.status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{case_id}/dispose")
def dispose_complaint(case_id: str, data: CaseDisposeRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ensure_can_act_on_case(user, _load_case(db, case_id))
    try:
        updated = dispose_case(db=db, case_id=case_id, disposal_summary=data.disposal_summary,
                               resolution_type=data.resolution_type, actor_user_id=user.user_id)
        return {"message": "Case marked as DISPOSED with recorded action",
                "actual_disposal_at": updated.actual_disposal_at, "status": updated.status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{case_id}/close")
def close_complaint(case_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ensure_can_act_on_case(user, _load_case(db, case_id))
    try:
        updated = close_case(db=db, case_id=case_id, actor_user_id=user.user_id)
        return {"message": "Case formally CLOSED", "status": updated.status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{case_id}/duplicate-decision")
def decide_duplicate(case_id: str, data: DuplicateDecisionRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Confirm or dismiss a system-proposed duplicate link."""
    ensure_can_act_on_case(user, _load_case(db, case_id))
    try:
        return set_duplicate_decision(db, case_id, data.decision, user.user_id)
    except IntakeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{case_id}/actions", response_model=List[CaseActionOut])
def get_case_actions(case_id: str, db: Session = Depends(get_db)):
    return db.query(CaseAction).filter(CaseAction.case_id == case_id).order_by(CaseAction.created_at.desc()).all()


@router.post("/{case_id}/actions", status_code=201)
def add_case_action(case_id: str, data: CaseActionCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    case = _load_case(db, case_id)
    ensure_can_act_on_case(user, case)
    now = datetime.now(timezone.utc)
    action = CaseAction(
        case_id=case_id,
        action_type=data.action_type,
        previous_status=case.status,
        new_status=case.status,
        actor_user_id=user.user_id,
        remarks=data.remarks,
        next_action=data.next_action,
        created_at=now,
    )
    db.add(action)
    if data.next_action:
        case.next_action = data.next_action
    case.last_action_summary = data.remarks[:100]
    case.last_action_at = now
    db.commit()
    db.refresh(action)
    return action

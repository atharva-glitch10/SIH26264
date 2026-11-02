from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user, ensure_permission
from backend.app.models.models import MatchingReviewQueue, Institution
from backend.app.schemas.schemas import MatchingQueueItemOut, MatchingDecisionRequest
from backend.app.services.matching_service import match_institution, review_matching_candidate

router = APIRouter(prefix="/matching", tags=["Institution Matching"])

class MatchQueryRequest(BaseModel):
    raw_name: str
    aicte_permanent_id: Optional[str] = None

@router.post("/match")
def perform_match(data: MatchQueryRequest, db: Session = Depends(get_db)):
    result = match_institution(
        db=db,
        raw_name=data.raw_name,
        aicte_permanent_id=data.aicte_permanent_id
    )
    return result

@router.get("/review-queue")
def get_review_queue(
    decision_status: str = Query("PENDING", description="Filter by decision status (PENDING, APPROVED, REJECTED)"),
    db: Session = Depends(get_db)
):
    query = db.query(MatchingReviewQueue)
    if decision_status != "ALL":
        query = query.filter(MatchingReviewQueue.decision_status == decision_status)
        
    items = query.order_by(MatchingReviewQueue.created_at.desc()).all()
    
    result = []
    for it in items:
        cand = it.candidate_institution
        result.append({
            "match_id": it.match_id,
            "raw_input_name": it.raw_input_name,
            "candidate_institution_id": it.candidate_institution_id,
            "candidate_institution_name": cand.canonical_name if cand else "Unknown",
            "candidate_permanent_id": cand.aicte_permanent_id if cand else None,
            "confidence_score": it.confidence_score,
            "matching_method": it.matching_method,
            "decision_status": it.decision_status,
            "created_at": it.created_at
        })
    return result

@router.post("/{match_id}/review")
def review_match(
    match_id: int,
    data: MatchingDecisionRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    ensure_permission(user, "matching:review")
    if data.decision.upper() not in ("APPROVED", "REJECTED"):
        raise HTTPException(status_code=400, detail="decision must be APPROVED or REJECTED")
    try:
        return review_matching_candidate(
            db=db,
            match_id=match_id,
            decision=data.decision,
            reviewer_id=user.user_id,
            create_alias=data.create_alias
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

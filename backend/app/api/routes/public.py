from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.models import Case

router = APIRouter(prefix="/public", tags=["Public"])


class PublicStatusOut(BaseModel):
    status: str
    bureau_code: Optional[str] = None
    received_at: datetime
    sla_due_at: Optional[datetime] = None
    last_action_summary: Optional[str] = None


@router.get("/status/{complaint_reference:path}", response_model=PublicStatusOut)
def public_status(complaint_reference: str, db: Session = Depends(get_db)):
    """Unauthenticated complaint tracker. Exposes only the five fields in PublicStatusOut."""
    case = db.query(Case).filter(Case.complaint_reference == complaint_reference.strip()).first()
    if not case:
        raise HTTPException(status_code=404, detail="No complaint found for this reference number")
    return PublicStatusOut(
        status=case.status,
        bureau_code=case.current_bureau.bureau_code if case.current_bureau else None,
        received_at=case.received_at,
        sla_due_at=case.expected_disposal_at,
        last_action_summary=case.last_action_summary,
    )

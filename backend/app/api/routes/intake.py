"""
External intake API - lets other systems (CPGRAMS, the AICTE portal, a bureau's
own software) push complaints straight into the central dashboard.

Authenticate with a Bearer token or, for machine-to-machine use, the
`X-API-Key` header (set INTAKE_API_KEY in the environment).
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.api.deps import ensure_can_register, get_current_user, get_viewer
from backend.app.core.database import get_db
from backend.app.schemas.schemas import IntakePreviewRequest, IntakeRequest
from backend.app.services.intake_service import IntakeError, preview_intake, process_intake

router = APIRouter(prefix="/intake", tags=["Smart Intake & Integration API"])


@router.post("/preview")
def preview(data: IntakePreviewRequest, db: Session = Depends(get_db), user=Depends(get_viewer)):
    """Live suggestions while an officer types: institution match, category, priority, possible duplicates."""
    return preview_intake(db, data)


@router.post("/complaints", status_code=201)
def submit_complaint(data: IntakeRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ensure_can_register(user, data.source_bureau_id)
    channel = "API" if user.role == "SYSTEM_INTEGRATION" else "PORTAL"
    try:
        return process_intake(db, data, actor_user_id=user.user_id, channel=channel)
    except IntakeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/complaints/batch", status_code=201)
def submit_batch(items: List[IntakeRequest], db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Push up to 500 complaints in one call; each result is reported separately."""
    if len(items) > 500:
        raise HTTPException(status_code=413, detail="Maximum 500 complaints per batch")
    channel = "API" if user.role == "SYSTEM_INTEGRATION" else "PORTAL"
    results = []
    for i, item in enumerate(items):
        try:
            ensure_can_register(user, item.source_bureau_id)
            results.append({"index": i, "ok": True, **process_intake(db, item, actor_user_id=user.user_id, channel=channel)})
        except HTTPException as e:
            results.append({"index": i, "ok": False, "error": e.detail})
        except IntakeError as e:
            db.rollback()
            results.append({"index": i, "ok": False, "error": str(e)})
    return {"submitted": len(items), "created": sum(1 for r in results if r["ok"]), "results": results}

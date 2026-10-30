from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from backend.app.api.deps import ensure_can_import, get_current_user, permissions_for
from backend.app.core.database import get_db
from backend.app.models.models import ImportBatch
from backend.app.services.import_service import TEMPLATE_CSV, batch_to_dict, run_import
from backend.app.services.intake_service import IntakeError

router = APIRouter(prefix="/imports", tags=["Bulk Import (Integration Layer)"])

MAX_UPLOAD_BYTES = 10 * 1024 * 1024


@router.get("/template")
def download_template():
    """Sample CSV showing accepted columns (headers are matched flexibly)."""
    return Response(content=TEMPLATE_CSV, media_type="text/csv",
                    headers={"Content-Disposition": 'attachment; filename="complaint_import_template.csv"'})


@router.post("/upload")
async def upload_complaints(
    file: UploadFile = File(...),
    source_bureau_id: Optional[str] = Form(None),
    dry_run: bool = Form(False),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Import a bureau's complaint sheet (.csv / .xlsx). Each row is auto-linked to an
    institution, auto-categorised, checked for duplicates and scanned for cross-bureau
    overlaps. Use dry_run=true to validate and preview without saving.
    """
    ensure_can_import(user, source_bureau_id)
    own_bureau_only = None if "import:any" in permissions_for(user) else user.bureau_id
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")
    try:
        return run_import(db, content, file.filename or "upload.csv", actor_user_id=user.user_id,
                          default_bureau_id=source_bureau_id or own_bureau_only, dry_run=dry_run,
                          allowed_bureau_id=own_bureau_only)
    except IntakeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("")
def list_import_batches(limit: int = 20, db: Session = Depends(get_db)):
    batches = db.query(ImportBatch).order_by(ImportBatch.imported_at.desc()).limit(limit).all()
    return [batch_to_dict(b) for b in batches]


@router.get("/{import_id}")
def get_import_batch(import_id: str, db: Session = Depends(get_db)):
    batch = db.query(ImportBatch).filter(ImportBatch.import_id == import_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Import batch not found")
    return batch_to_dict(batch)

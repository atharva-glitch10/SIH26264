from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid

from backend.app.core.database import get_db
from backend.app.models.models import ImportBatch

router = APIRouter(prefix="/imports", tags=["Data Import Batches"])

@router.post("")
def create_import_batch(source: str = "CSV_IMPORT", db: Session = Depends(get_db)):
    batch_id = f"IMP-{uuid.uuid4().hex[:8].upper()}"
    batch = ImportBatch(
        import_id=batch_id,
        source=source,
        imported_at=datetime.now(timezone.utc),
        record_count=0,
        valid_count=0,
        rejected_count=0,
        processing_status="COMPLETED"
    )
    db.add(batch)
    db.commit()
    return {"import_id": batch_id, "status": "COMPLETED"}

@router.get("/{import_id}")
def get_import_batch(import_id: str, db: Session = Depends(get_db)):
    batch = db.query(ImportBatch).filter(ImportBatch.import_id == import_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Import batch not found")
    return {
        "import_id": batch.import_id,
        "source": batch.source,
        "imported_at": batch.imported_at,
        "record_count": batch.record_count,
        "valid_count": batch.valid_count,
        "rejected_count": batch.rejected_count,
        "processing_status": batch.processing_status
    }

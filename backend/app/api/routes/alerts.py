from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from backend.app.core.database import get_db
from backend.app.schemas.schemas import NotificationOut
from backend.app.services.notification_service import get_notifications, mark_notification_read

router = APIRouter(prefix="/alerts", tags=["System Notifications & Alerts"])

@router.get("", response_model=List[NotificationOut])
def list_alerts(
    user_id: Optional[str] = Query(None),
    bureau_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return get_notifications(db=db, user_id=user_id, bureau_id=bureau_id, limit=limit)

@router.patch("/{alert_id}/read", response_model=NotificationOut)
def read_alert(alert_id: int, db: Session = Depends(get_db)):
    return mark_notification_read(db=db, notification_id=alert_id)

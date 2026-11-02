from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.api.deps import ADMIN_ROLES, ensure_permission, get_current_user
from backend.app.core.database import get_db
from backend.app.schemas.schemas import NotificationOut
from backend.app.services.notification_service import get_notifications, mark_notification_read
from backend.app.services.sla_monitor_service import run_sla_scan

router = APIRouter(prefix="/alerts", tags=["System Notifications & Alerts"])


@router.get("", response_model=List[NotificationOut])
def list_alerts(
    bureau_id: Optional[str] = Query(None, description="Defaults to the signed-in officer's bureau"),
    alert_type: Optional[str] = Query(None),
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Bureau officers see their bureau's alerts + broadcasts; management sees everything.
    scope_bureau = bureau_id if user.role in ADMIN_ROLES else (user.bureau_id or bureau_id)
    return get_notifications(db=db, user_id=user.user_id, bureau_id=scope_bureau, limit=limit,
                             alert_type=alert_type, unread_only=unread_only)


@router.patch("/{alert_id}/read", response_model=NotificationOut)
def read_alert(alert_id: int, db: Session = Depends(get_db)):
    notif = mark_notification_read(db=db, notification_id=alert_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif


@router.post("/run-sla-scan")
def trigger_sla_scan(db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Run the SLA monitor now (it also runs automatically in the background)."""
    ensure_permission(user, "sla:run")
    return run_sla_scan(db)

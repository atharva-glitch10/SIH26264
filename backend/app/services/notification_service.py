from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.models import Notification

def get_notifications(
    db: Session,
    user_id: Optional[str] = None,
    bureau_id: Optional[str] = None,
    limit: int = 50
) -> List[Notification]:
    query = db.query(Notification)
    if user_id:
        query = query.filter((Notification.user_id == user_id) | (Notification.user_id.is_(None)))
    if bureau_id:
        query = query.filter((Notification.bureau_id == bureau_id) | (Notification.bureau_id.is_(None)))
        
    return query.order_by(Notification.created_at.desc()).limit(limit).all()

def mark_notification_read(db: Session, notification_id: int) -> Notification:
    notif = db.query(Notification).filter(Notification.notification_id == notification_id).first()
    if notif and not notif.read_at:
        notif.read_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(notif)
    return notif

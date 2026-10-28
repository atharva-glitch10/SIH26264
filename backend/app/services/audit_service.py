import json
from datetime import datetime, timezone
from typing import Optional, Any
from sqlalchemy.orm import Session
from backend.app.models.models import AuditLog

def record_audit_log(
    db: Session,
    actor_user_id: str,
    entity_type: str,
    entity_id: str,
    action: str,
    before: Optional[Any] = None,
    after: Optional[Any] = None
) -> AuditLog:
    """Records an immutable audit log entry."""
    before_str = json.dumps(before, default=str) if before is not None else None
    after_str = json.dumps(after, default=str) if after is not None else None
    
    log = AuditLog(
        actor_user_id=actor_user_id,
        entity_type=entity_type,
        entity_id=str(entity_id),
        action=action,
        before_snapshot=before_str,
        after_snapshot=after_str,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(log)
    return log

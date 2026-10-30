"""Database side of the SLA monitor: turns SLA events into notifications and auto-escalations."""
import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Dict

from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.models.models import Case, Notification
from backend.app.services.sla_rules_engine import ACTIVE, evaluate_sla_events
from backend.app.services.sla_service import load_sla_rules
from backend.app.services.workflow_service import escalate_case

log = logging.getLogger(__name__)


def run_sla_scan(db: Session, now: datetime = None) -> Dict[str, Any]:
    now = now or datetime.now(timezone.utc)
    rules = load_sla_rules()
    created: Dict[str, int] = {}
    escalated = []

    for case in db.query(Case).filter(Case.status.in_(ACTIVE)).all():
        result = evaluate_sla_events(case, rules, now)
        for ev in result["events"]:
            exists = db.query(Notification.notification_id).filter(
                Notification.alert_type == ev["type"],
                Notification.reference_id == case.case_id,
                Notification.message.like(f"{ev['tag']}%"),
            ).first()
            if exists:
                continue
            db.add(Notification(bureau_id=case.current_bureau_id, alert_type=ev["type"],
                                reference_id=case.case_id, message=ev["message"][:255], created_at=now))
            created[ev["type"]] = created.get(ev["type"], 0) + 1
        db.commit()
        if result["auto_escalate"]:
            try:
                escalate_case(db, case.case_id, actor_user_id="SYSTEM",
                              reason=f"Auto-escalated by SLA monitor: elapsed time exceeded "
                                     f"{rules.get('escalation_threshold_ratio', 1.5)}x the SLA window")
                escalated.append(case.case_id)
            except ValueError as e:
                db.rollback()
                log.warning("Auto-escalation skipped for %s: %s", case.case_id, e)

    return {"notifications_created": created, "auto_escalated": escalated, "scanned_at": now.isoformat()}


async def sla_monitor_loop(session_factory) -> None:
    """Background task started from main.py lifespan."""
    interval = max(1, settings.SLA_SCAN_INTERVAL_MINUTES) * 60
    while True:
        try:
            db = session_factory()
            try:
                summary = run_sla_scan(db)
                log.info("SLA scan: %s", summary)
            finally:
                db.close()
        except Exception:  # keep the loop alive
            log.exception("SLA monitor iteration failed")
        await asyncio.sleep(interval)

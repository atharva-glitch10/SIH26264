"""
Collision-safe sequential identifiers.

The original code built IDs from `COUNT(*) + 1`, which repeats an existing ID
as soon as any row is deleted. Here we read the highest existing suffix for the
current prefix instead.
"""
from datetime import datetime, timezone
from sqlalchemy import func
from sqlalchemy.orm import Session


def current_year() -> int:
    return datetime.now(timezone.utc).year


def next_sequential_id(db: Session, column, prefix: str, width: int) -> str:
    """
    Return `{prefix}{n:0{width}d}` where n = (highest numeric suffix among rows
    whose `column` starts with `prefix`) + 1.
    """
    rows = db.query(column).filter(column.like(f"{prefix}%")).all()
    highest = 0
    for (value,) in rows:
        suffix = str(value)[len(prefix):]
        if suffix.isdigit():
            highest = max(highest, int(suffix))
    return f"{prefix}{highest + 1:0{width}d}"


def next_case_id(db: Session) -> str:
    from backend.app.models.models import Case
    return next_sequential_id(db, Case.case_id, f"CASE-{current_year()}-", 5)


def next_complaint_reference(db: Session, bureau_code: str) -> str:
    from backend.app.models.models import Case
    return next_sequential_id(db, Case.complaint_reference, f"AICTE/{bureau_code}/{current_year()}/", 5)


def next_overlap_alert_id(db: Session) -> str:
    from backend.app.models.models import OverlapAlert
    return next_sequential_id(db, OverlapAlert.alert_id, f"OVR-{current_year()}-", 4)

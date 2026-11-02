"""
Explainable institution risk score and repeat-offender flag (pure Python).

Score (0-100) is the sum of capped components so officers can see exactly why
a college is flagged. Weights live here deliberately (one place to tune).
"""
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Iterable, List, Optional

CLOSED = ("DISPOSED", "CLOSED")


def _aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _get(obj: Any, key: str):
    return obj.get(key) if isinstance(obj, dict) else getattr(obj, key, None)


def compute_risk(cases: Iterable[Any], has_active_overlap: bool, now: Optional[datetime] = None,
                 window_days: int = 365) -> Dict[str, Any]:
    now = now or datetime.now(timezone.utc)
    since = now - timedelta(days=window_days)
    cases = list(cases)
    recent = [c for c in cases if (_aware(_get(c, "received_at")) or now) >= since]
    active = [c for c in cases if _get(c, "status") not in CLOSED]

    overdue = sum(1 for c in active if (_aware(_get(c, "expected_disposal_at")) or now) < now)
    escalated = sum(1 for c in active if _get(c, "status") == "ESCALATED")
    serious = sum(1 for c in recent if _get(c, "priority") in ("HIGH", "URGENT"))
    active_bureaus = {_get(c, "current_bureau_id") for c in active}
    category_counts = Counter(_get(c, "category") for c in recent)
    top_category, top_count = (category_counts.most_common(1)[0] if category_counts else (None, 0))

    components = []

    def add(points: float, cap: float, reason: str):
        pts = min(points, cap)
        if pts > 0:
            components.append((round(pts), reason))

    add(len(recent) * 3, 30, f"{len(recent)} complaint(s) in the last {window_days // 30} months")
    add(max(0, len(active_bureaus) - 1) * 10, 20, f"active cases in {len(active_bureaus)} bureaus")
    add(overdue * 5, 20, f"{overdue} overdue case(s)")
    add(escalated * 5, 10, f"{escalated} escalated case(s)")
    add(serious * 2, 10, f"{serious} high/urgent complaint(s)")
    if top_count >= 3:
        add(10, 10, f"repeated '{top_category}' complaints ({top_count})")
    if has_active_overlap:
        add(10, 10, "unresolved cross-bureau overlap")

    score = int(min(100, sum(p for p, _ in components)))
    level = "HIGH" if score >= 60 else "MEDIUM" if score >= 30 else "LOW"
    repeat_offender = len(recent) >= 5 or top_count >= 3
    components.sort(reverse=True)
    return {
        "risk_score": score,
        "risk_level": level,
        "is_repeat_offender": repeat_offender,
        "risk_factors": [f"+{p} {r}" for p, r in components],
    }

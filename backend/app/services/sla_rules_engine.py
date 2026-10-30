"""
Pure SLA event rules (no database imports).

Given one case and the SLA config, decide which alerts are due right now:
- SLA_APPROACHING  : deadline within a reminder window (7 / 3 / 1 days by default)
- SLA_BREACHED     : past the expected disposal date
- STAGNANT_CASE    : no recorded action for `stagnant_case_threshold_days` (repeats each period)
- TRANSFER_UNACKNOWLEDGED : still TRANSFERRED after `transfer_acknowledgment_days`
- auto-escalation  : elapsed >= escalation_threshold_ratio x SLA window
Each event carries a stable `tag` so the scanner never sends the same alert twice.
"""
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

ACTIVE = ("RECEIVED", "PENDING", "UNDER_PROCESS", "TRANSFERRED", "ESCALATED")


def _aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _get(obj: Any, key: str):
    return obj.get(key) if isinstance(obj, dict) else getattr(obj, key, None)


def evaluate_sla_events(case: Any, rules: Dict[str, Any], now: Optional[datetime] = None) -> Dict[str, Any]:
    now = now or datetime.now(timezone.utc)
    status = _get(case, "status")
    if status not in ACTIVE:
        return {"events": [], "auto_escalate": False}

    case_id = _get(case, "case_id")
    received = _aware(_get(case, "received_at")) or now
    deadline = _aware(_get(case, "expected_disposal_at")) or now
    last_action = _aware(_get(case, "last_action_at")) or received
    events: List[Dict[str, str]] = []

    seconds_left = (deadline - now).total_seconds()
    days_left = seconds_left / 86400
    if seconds_left < 0:
        overdue_days = int(-days_left)
        events.append({"type": "SLA_BREACHED", "tag": "[BREACH]",
                       "message": f"[BREACH] {case_id} is past its SLA deadline by {overdue_days} day(s)"})
    else:
        for window in sorted(rules.get("reminder_windows_days", [7, 3, 1])):
            if days_left <= window:
                events.append({"type": "SLA_APPROACHING", "tag": f"[SLA-{window}d]",
                               "message": f"[SLA-{window}d] {case_id} is due within {window} day(s)"})
                break  # only the tightest window that applies

    stagnant_days = int(rules.get("stagnant_case_threshold_days", 14))
    idle = (now - last_action).days
    if stagnant_days > 0 and idle >= stagnant_days:
        period = idle // stagnant_days
        events.append({"type": "STAGNANT_CASE", "tag": f"[STAGNANT-{period}]",
                       "message": f"[STAGNANT-{period}] {case_id} has had no action for {idle} days"})

    ack_days = int(rules.get("transfer_acknowledgment_days", 5))
    if status == "TRANSFERRED" and idle >= ack_days:
        events.append({"type": "TRANSFER_UNACKNOWLEDGED", "tag": "[XFER-ACK]",
                       "message": f"[XFER-ACK] {case_id} transfer not acknowledged for {idle} days"})

    auto_escalate = False
    if rules.get("auto_escalation_enabled", False) and status in ("PENDING", "UNDER_PROCESS", "TRANSFERRED"):
        window_s = max(1.0, (deadline - received).total_seconds())
        ratio = (now - received).total_seconds() / window_s
        auto_escalate = ratio >= float(rules.get("escalation_threshold_ratio", 1.5))

    return {"events": events, "auto_escalate": auto_escalate}

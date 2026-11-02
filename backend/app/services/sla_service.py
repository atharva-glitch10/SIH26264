import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from backend.app.core.config import settings

def load_sla_rules() -> Dict[str, Any]:
    if settings.SLA_RULES_PATH.exists():
        with open(settings.SLA_RULES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "sla_days_by_priority": {"URGENT": 15, "HIGH": 30, "MEDIUM": 45, "LOW": 60},
        "reminder_windows_days": [7, 3, 1],
        "stagnant_case_threshold_days": 14,
        "transfer_acknowledgment_days": 5
    }

def calculate_expected_disposal_date(received_at: datetime, priority: str) -> datetime:
    rules = load_sla_rules()
    days = rules.get("sla_days_by_priority", {}).get(priority.upper(), 45)
    return received_at + timedelta(days=days)

def evaluate_case_sla(
    received_at: datetime,
    expected_disposal_at: datetime,
    status: str,
    actual_disposal_at: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Evaluates SLA indicators for a case:
    - days_pending
    - is_overdue
    - sla_status: DISPOSED, OVERDUE, APPROACHING_DEADLINE, ON_TRACK
    """
    now = datetime.now(timezone.utc)
    # Ensure timezone awareness if naive
    if received_at.tzinfo is None:
        received_at = received_at.replace(tzinfo=timezone.utc)
    if expected_disposal_at.tzinfo is None:
        expected_disposal_at = expected_disposal_at.replace(tzinfo=timezone.utc)
    
    if status in ("DISPOSED", "CLOSED"):
        end_time = actual_disposal_at or now
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)
        days_pending = max(0, (end_time - received_at).days)
        is_overdue = end_time > expected_disposal_at
        return {
            "days_pending": days_pending,
            "is_overdue": is_overdue,
            "sla_status": "DISPOSED"
        }
    
    days_pending = max(0, (now - received_at).days)
    is_overdue = now > expected_disposal_at
    
    if is_overdue:
        sla_status = "OVERDUE"
    else:
        # Check if approaching deadline (within 7 days)
        time_to_deadline = expected_disposal_at - now
        if time_to_deadline <= timedelta(days=7):
            sla_status = "APPROACHING_DEADLINE"
        else:
            sla_status = "ON_TRACK"
            
    return {
        "days_pending": days_pending,
        "is_overdue": is_overdue,
        "sla_status": sla_status
    }

from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict

# --- Pagination ---
class PaginationMeta(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int

# --- Bureau & User Schemas ---
class BureauOut(BaseModel):
    bureau_id: str
    bureau_code: str
    bureau_name: str
    description: Optional[str] = None
    active: bool

    model_config = ConfigDict(from_attributes=True)

class UserOut(BaseModel):
    user_id: str
    display_name: str
    role: str
    bureau_id: Optional[str] = None
    email: Optional[str] = None
    active: bool

    model_config = ConfigDict(from_attributes=True)

# --- Institution Aliases ---
class InstitutionAliasOut(BaseModel):
    alias_id: int
    alias_name: str
    normalized_alias: str
    source: str
    verification_status: str

    model_config = ConfigDict(from_attributes=True)

# --- Institution Schemas ---
class InstitutionBase(BaseModel):
    aicte_permanent_id: Optional[str] = None
    canonical_name: str
    institution_type: str
    region: str
    state: str
    district: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

class InstitutionCreate(InstitutionBase):
    pass

class InstitutionUpdate(BaseModel):
    canonical_name: Optional[str] = None
    institution_type: Optional[str] = None
    region: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

class InstitutionOut(InstitutionBase):
    institution_id: str
    created_at: datetime
    updated_at: datetime
    active_cases_count: int = 0
    pending_cases_count: int = 0
    overdue_cases_count: int = 0
    bureaus_count: int = 0
    has_active_overlap: bool = False
    risk_level: str = "LOW"  # LOW, MEDIUM, HIGH

    model_config = ConfigDict(from_attributes=True)

class InstitutionDetailOut(InstitutionOut):
    aliases: List[InstitutionAliasOut] = []
    cases_summary: Dict[str, int] = {}
    participating_bureaus: List[str] = []

# --- Case Actions ---
class CaseActionOut(BaseModel):
    action_id: int
    case_id: str
    action_type: str
    previous_status: Optional[str] = None
    new_status: str
    previous_bureau_id: Optional[str] = None
    new_bureau_id: Optional[str] = None
    actor_user_id: str
    remarks: str
    next_action: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CaseActionCreate(BaseModel):
    action_type: str
    remarks: str
    next_action: Optional[str] = None
    actor_user_id: Optional[str] = "USR-SYS-01"

# --- Cases Schemas ---
class CaseBase(BaseModel):
    institution_id: str
    category: str
    priority: str = "MEDIUM"
    description: str
    source_bureau_id: str
    assigned_user_id: Optional[str] = None

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    category: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    next_action: Optional[str] = None

class CaseAssignRequest(BaseModel):
    assigned_user_id: str
    remarks: str
    actor_user_id: Optional[str] = "USR-SYS-01"

class CaseTransferRequest(BaseModel):
    destination_bureau_id: str
    reason: str
    actor_user_id: Optional[str] = "USR-SYS-01"

class CaseEscalateRequest(BaseModel):
    reason: str
    actor_user_id: Optional[str] = "USR-SYS-01"

class CaseDisposeRequest(BaseModel):
    disposal_summary: str
    resolution_type: str = "RESOLVED"
    actor_user_id: Optional[str] = "USR-SYS-01"

class CaseOut(BaseModel):
    case_id: str
    complaint_reference: str
    institution_id: str
    institution_name: Optional[str] = None
    source_bureau_id: str
    current_bureau_id: str
    current_bureau_name: Optional[str] = None
    assigned_user_id: Optional[str] = None
    assigned_user_name: Optional[str] = None
    category: str
    priority: str
    description: str
    status: str
    received_at: datetime
    last_action_at: datetime
    last_action_summary: Optional[str] = None
    next_action: Optional[str] = None
    expected_disposal_at: datetime
    actual_disposal_at: Optional[datetime] = None
    days_pending: int = 0
    is_overdue: bool = False
    sla_status: str = "ON_TRACK"  # ON_TRACK, APPROACHING_DEADLINE, OVERDUE, DISPOSED
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RelatedCaseOut(BaseModel):
    relationship_id: int
    source_case_id: str
    related_case_id: str
    relationship_type: str
    decision_status: str
    reason: str
    created_by: str
    created_at: datetime
    related_case: Optional[CaseOut] = None

    model_config = ConfigDict(from_attributes=True)

class CaseDetailOut(CaseOut):
    actions: List[CaseActionOut] = []
    related_cases: List[RelatedCaseOut] = []
    active_overlap_alert_id: Optional[str] = None

# --- Overlap Alert Schemas ---
class OverlapCaseSummary(BaseModel):
    case_id: str
    complaint_reference: str
    bureau_id: str
    bureau_code: str
    category: str
    priority: str
    status: str
    received_at: datetime
    last_action_summary: Optional[str] = None
    next_action: Optional[str] = None
    assigned_user_name: Optional[str] = None

class OverlapAlertOut(BaseModel):
    alert_id: str
    institution_id: str
    institution_name: str
    aicte_permanent_id: Optional[str] = None
    alert_type: str
    severity: str
    status: str
    explanation: str
    recommended_action: str
    resolution_reason: Optional[str] = None
    lead_bureau_id: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    participating_bureaus: List[str] = []
    cases_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class OverlapAlertDetailOut(OverlapAlertOut):
    cases: List[OverlapCaseSummary] = []

class OverlapReviewRequest(BaseModel):
    remarks: Optional[str] = None
    reviewer_id: Optional[str] = "USR-SYS-01"

class OverlapLinkRequest(BaseModel):
    source_case_id: str
    target_case_id: str
    reason: str
    lead_bureau_id: Optional[str] = None
    actor_user_id: Optional[str] = "USR-SYS-01"

class OverlapResolveRequest(BaseModel):
    resolution_reason: str
    lead_bureau_id: Optional[str] = None
    actor_user_id: Optional[str] = "USR-SYS-01"

class OverlapDismissRequest(BaseModel):
    justification: str
    actor_user_id: Optional[str] = "USR-SYS-01"

# --- Matching Queue Schemas ---
class MatchingQueueItemOut(BaseModel):
    match_id: int
    raw_input_name: str
    candidate_institution_id: str
    candidate_institution_name: str
    candidate_permanent_id: Optional[str] = None
    confidence_score: float
    matching_method: str
    decision_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MatchingDecisionRequest(BaseModel):
    decision: str  # APPROVED, REJECTED
    reviewer_id: Optional[str] = "USR-SYS-01"
    create_alias: bool = True

# --- Notification Schemas ---
class NotificationOut(BaseModel):
    notification_id: int
    user_id: Optional[str] = None
    bureau_id: Optional[str] = None
    alert_type: str
    reference_id: Optional[str] = None
    message: str
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Dashboard & Reports Schemas ---
class DashboardSummaryOut(BaseModel):
    total_cases: int
    pending_cases: int
    under_process_cases: int
    disposed_cases: int
    transferred_cases: int
    escalated_cases: int
    overdue_cases: int
    unresolved_overlap_alerts: int
    total_institutions: int
    multi_bureau_institutions_count: int

class BureauWorkloadItem(BaseModel):
    bureau_id: str
    bureau_code: str
    bureau_name: str
    total_cases: int
    received_cases: int
    under_process_cases: int
    pending_cases: int
    transferred_cases: int
    escalated_cases: int
    disposed_cases: int
    overdue_cases: int

class StatusDistributionItem(BaseModel):
    status: str
    count: int
    percentage: float

class RegionDistributionItem(BaseModel):
    region: str
    count: int
    institutions_count: int
    active_cases: int

class AgeingBucketItem(BaseModel):
    bucket: str  # 0-15 Days, 16-30 Days, 31-60 Days, 61-90 Days, >90 Days
    count: int

class MonthlyTrendItem(BaseModel):
    month: str  # YYYY-MM
    received: int
    disposed: int

# --- Audit Logs ---
class AuditLogOut(BaseModel):
    audit_id: int
    actor_user_id: str
    entity_type: str
    entity_id: str
    action: str
    before_snapshot: Optional[str] = None
    after_snapshot: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

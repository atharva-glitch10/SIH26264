export interface DashboardSummary {
  total_cases: number;
  pending_cases: number;
  under_process_cases: number;
  disposed_cases: number;
  transferred_cases: number;
  escalated_cases: number;
  overdue_cases: number;
  unresolved_overlap_alerts: number;
  total_institutions: number;
  multi_bureau_institutions_count: number;
}

export interface BureauWorkloadItem {
  bureau_id: string;
  bureau_code: string;
  bureau_name: string;
  total_cases: number;
  received_cases: number;
  pending_cases: number;
  under_process_cases: number;
  transferred_cases: number;
  escalated_cases: number;
  disposed_cases: number;
  overdue_cases: number;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
  percentage: number;
}

export interface RegionDistributionItem {
  region: string;
  count: number;
  institutions_count: number;
  active_cases: number;
}

export interface AgeingBucketItem {
  bucket: string;
  count: number;
}

export interface MonthlyTrendItem {
  month: string;
  received: number;
  disposed: number;
}

export interface Institution {
  institution_id: string;
  aicte_permanent_id?: string;
  canonical_name: string;
  institution_type: string;
  region: string;
  state: string;
  district?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
  active_cases_count: number;
  pending_cases_count: number;
  overdue_cases_count: number;
  bureaus_count: number;
  has_active_overlap: boolean;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  cases_summary?: Record<string, number>;
  participating_bureaus?: string[];
}

export interface InstitutionAlias {
  alias_id: number;
  alias_name: string;
  normalized_alias: string;
  source: string;
  verification_status: string;
}

export interface CaseAction {
  action_id: number;
  case_id: string;
  action_type: string;
  previous_status?: string;
  new_status: string;
  previous_bureau_id?: string;
  new_bureau_id?: string;
  actor_user_id: string;
  remarks: string;
  next_action?: string;
  created_at: string;
}

export interface RelatedCase {
  relationship_id: number;
  source_case_id: string;
  related_case_id: string;
  relationship_type: string;
  decision_status: string;
  reason: string;
  created_by: string;
  created_at: string;
  related_case?: Case;
}

export interface Case {
  case_id: string;
  complaint_reference: string;
  institution_id: string;
  institution_name?: string;
  source_bureau_id: string;
  current_bureau_id: string;
  current_bureau_name?: string;
  assigned_user_id?: string;
  assigned_user_name?: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  description: string;
  status: "RECEIVED" | "PENDING" | "UNDER_PROCESS" | "TRANSFERRED" | "ESCALATED" | "DISPOSED" | "CLOSED";
  received_at: string;
  last_action_at: string;
  last_action_summary?: string;
  next_action?: string;
  expected_disposal_at: string;
  actual_disposal_at?: string;
  days_pending: number;
  is_overdue: boolean;
  sla_status: "ON_TRACK" | "APPROACHING_DEADLINE" | "OVERDUE" | "DISPOSED";
  created_at: string;
  updated_at: string;
}

export interface CaseDetail extends Case {
  actions: CaseAction[];
  related_cases: RelatedCase[];
  active_overlap_alert_id?: string;
}

export interface OverlapCaseSummary {
  case_id: string;
  complaint_reference: string;
  bureau_id: string;
  bureau_code: string;
  category: string;
  priority: string;
  status: string;
  received_at: string;
  last_action_summary?: string;
  next_action?: string;
  assigned_user_name?: string;
}

export interface OverlapAlert {
  alert_id: string;
  institution_id: string;
  institution_name: string;
  aicte_permanent_id?: string;
  alert_type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "NEW" | "UNDER_REVIEW" | "COORDINATION_REQUIRED" | "LINKED_ACKNOWLEDGED" | "RESOLVED" | "DISMISSED";
  explanation: string;
  recommended_action: string;
  resolution_reason?: string;
  lead_bureau_id?: string;
  created_at: string;
  reviewed_at?: string;
  resolved_at?: string;
  participating_bureaus: string[];
  cases_count: number;
  cases?: OverlapCaseSummary[];
}

export interface NotificationItem {
  notification_id: number;
  user_id?: string;
  bureau_id?: string;
  alert_type: string;
  reference_id?: string;
  message: string;
  read_at?: string;
  created_at: string;
}

export interface MatchingQueueItem {
  match_id: number;
  raw_input_name: string;
  candidate_institution_id: string;
  candidate_institution_name: string;
  candidate_permanent_id?: string;
  confidence_score: number;
  matching_method: string;
  decision_status: string;
  created_at: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

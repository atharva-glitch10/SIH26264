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
  risk_score?: number;
  is_repeat_offender?: boolean;
  risk_factors?: string[];
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
  // Smart-intake metadata
  complainant_name?: string | null;
  complainant_contact?: string | null;
  intake_channel?: string | null;
  external_reference?: string | null;
  raw_institution_name?: string | null;
  institution_match_status?: "CONFIRMED" | "AUTO_MATCHED" | "PENDING_REVIEW" | "REJECTED" | null;
  institution_match_score?: number | null;
  category_source?: "MANUAL" | "AUTO" | null;
  category_confidence?: number | null;
  duplicate_of_case_id?: string | null;
  duplicate_score?: number | null;
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

// ---------------------------------------------------------------- auth
export type UserRole = "SUPER_ADMIN" | "SENIOR_MANAGEMENT" | "BUREAU_OFFICER" | "REGIONAL_OFFICER";

export interface CurrentUser {
  user_id: string;
  display_name: string;
  role: UserRole;
  bureau_id?: string | null;
  email?: string | null;
  terms_accepted_at?: string | null;
  permissions: string[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: Omit<CurrentUser, "permissions">;
  permissions: string[];
}

export interface PublicStatus {
  status: string;
  bureau_code: string | null;
  received_at: string;
  sla_due_at: string | null;
  last_action_summary: string | null;
}

export interface DemoAccount {
  user_id: string;
  display_name: string;
  role: UserRole;
  bureau_id?: string | null;
}

// ---------------------------------------------------------------- smart intake
export interface IntakePayload {
  institution_id?: string;
  institution_name?: string;
  aicte_permanent_id?: string;
  source_bureau_id: string;
  description: string;
  category?: string;
  priority?: string;
  complainant_name?: string;
  complainant_contact?: string;
  external_reference?: string;
}

export interface CategorySuggestion {
  value: string;
  source: "MANUAL" | "AUTO";
  confidence: number | null;
  suggested?: string;
  suggested_confidence?: number;
  alternatives: { category: string; confidence: number }[];
  evidence: string[];
  needs_confirmation: boolean;
}

export interface InstitutionLink {
  institution_id: string;
  canonical_name: string;
  match_status: string;
  score: number;
  method: string;
  details: string;
  queue_id?: number | null;
}

export interface DuplicateHit {
  case_id: string;
  complaint_reference: string;
  bureau_id: string;
  status: string;
  score: number;
  text_similarity: number;
  same_complainant: boolean;
  reasons: string[];
}

export interface IntakePreview {
  institution: InstitutionLink | null;
  institution_error: string | null;
  category: CategorySuggestion | null;
  priority: { priority: string; reason: string } | null;
  possible_duplicates: DuplicateHit[];
}

export interface IntakeResult {
  message: string;
  case_id: string;
  complaint_reference: string;
  expected_disposal_at: string;
  status: string;
  institution: InstitutionLink;
  category: CategorySuggestion;
  priority: { value: string; source: string; reason: string };
  duplicate: DuplicateHit | null;
  overlap_alert_id: string | null;
}

// ---------------------------------------------------------------- bulk import
export interface ImportRowResult {
  row: number;
  status: string;
  case_id?: string;
  external_reference?: string | null;
  institution?: string;
  match_status?: string;
  match_score?: number;
  category?: string;
  category_source?: string;
  category_confidence?: number | null;
  priority?: string;
  duplicate_of?: string | null;
  message?: string;
}

export interface ImportResult {
  import_id?: string;
  file_name: string;
  dry_run: boolean;
  total_rows: number;
  created: number;
  needs_review: number;
  duplicates_flagged: number;
  auto_categorized: number;
  rejected: number;
  skipped_already_imported: number;
  new_overlap_alerts: number;
  rows: ImportRowResult[];
}

export interface ImportBatch {
  import_id: string;
  file_name?: string;
  source_bureau_id?: string;
  created_by?: string;
  imported_at: string;
  record_count: number;
  valid_count: number;
  rejected_count: number;
  needs_review_count?: number;
  duplicate_count?: number;
  auto_categorized_count?: number;
  new_overlap_alerts?: number;
  errors: ImportRowResult[];
}

// ---------------------------------------------------------------- analytics
export interface AutomationStats {
  auto_linked_institutions: number;
  pending_institution_review: number;
  auto_categorized: number;
  auto_categorized_pct: number;
  avg_category_confidence: number | null;
  duplicates_flagged: number;
  overlap_alerts_total: number;
  sla_alerts_open: number;
  auto_escalated: number;
  intake_channels: { channel: string; count: number }[];
}

export interface HotspotInstitution {
  institution_id: string;
  canonical_name: string;
  state: string;
  region: string;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  is_repeat_offender: boolean;
  risk_factors: string[];
  active_cases: number;
  bureaus_count: number;
}

export interface Hotspots {
  top_institutions: HotspotInstitution[];
  repeat_offenders_count: number;
  states: { state: string; region: string; total_cases: number; active_cases: number; overdue_cases: number; high_risk_institutions: number }[];
}

export interface ModelMetrics {
  available: boolean;
  message?: string;
  generated_at?: string;
  fuzzy_backend?: string;
  classifier?: { test_size: number; accuracy: number; top2_accuracy: number; macro_f1: number; method: string };
  duplicate_detection?: { pairs: number; threshold: number; precision: number; recall: number; f1: number; note: string };
  institution_matching?: {
    variants_tested: number; auto_linked_pct: number; auto_link_precision: number | null; wrong_auto_links: number;
    sent_to_review_pct: number; end_to_end_correct_pct: number; unknown_colleges_tested: number;
    unknown_colleges_wrongly_auto_linked: number; method: string;
  };
  disclaimer?: string;
}

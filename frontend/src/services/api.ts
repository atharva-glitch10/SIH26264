import axios from 'axios';
import {
  DashboardSummary,
  BureauWorkloadItem,
  StatusDistributionItem,
  RegionDistributionItem,
  AgeingBucketItem,
  MonthlyTrendItem,
  Institution,
  Case,
  CaseDetail,
  CaseAction,
  OverlapAlert,
  NotificationItem,
  MatchingQueueItem,
  PaginatedResult,
  LoginResponse,
  CurrentUser,
  DemoAccount,
  PublicStatus,
  AutomationStats,
  Hotspots,
  IntakePayload,
  IntakeResult,
  IntakePreview,
  ImportResult,
  ImportBatch,
  ModelMetrics
} from '../types';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------- auth token handling
const TOKEN_KEY = 'aicte_token';
let memoryToken: string | null = null;

export const tokenStore = {
  get(): string | null {
    if (memoryToken) return memoryToken;
    try {
      memoryToken = window.localStorage.getItem(TOKEN_KEY);
    } catch {
      /* storage unavailable (private mode / sandbox) - keep in memory only */
    }
    return memoryToken;
  },
  set(token: string | null) {
    memoryToken = token;
    try {
      if (token) window.localStorage.setItem(TOKEN_KEY, token);
      else window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

let unauthorizedHandler: (() => void) | null = null;
export const onUnauthorized = (handler: () => void) => {
  unauthorizedHandler = handler;
};

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401 && !String(error?.config?.url || '').includes('/auth/login')) {
      tokenStore.set(null);
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

const saveBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

const filenameFrom = (disposition: string | undefined, fallback: string) => {
  const match = disposition?.match(/filename="?([^";]+)"?/);
  return match ? match[1] : fallback;
};

export const api = {
  // --- Auth ---
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>('/auth/login', { username, password });
    return res.data;
  },
  me: async (): Promise<CurrentUser> => {
    const res = await apiClient.get<CurrentUser>('/auth/me');
    return res.data;
  },
  acceptTerms: async (): Promise<{ terms_accepted_at: string }> => {
    const res = await apiClient.post('/auth/accept-terms');
    return res.data;
  },
  getPublicStatus: async (reference: string): Promise<PublicStatus> => {
    const res = await apiClient.get(`/public/status/${reference.split('/').map(encodeURIComponent).join('/')}`);
    return res.data;
  },
  getDemoAccounts: async (): Promise<{ demo_password: string; accounts: DemoAccount[] }> => {
    const res = await apiClient.get('/auth/demo-accounts');
    return res.data;
  },

  // --- Dashboard ---
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return res.data;
  },
  getBureauWorkload: async (): Promise<BureauWorkloadItem[]> => {
    const res = await apiClient.get<BureauWorkloadItem[]>('/dashboard/bureau-workload');
    return res.data;
  },
  getStatusDistribution: async (): Promise<StatusDistributionItem[]> => {
    const res = await apiClient.get<StatusDistributionItem[]>('/dashboard/status-distribution');
    return res.data;
  },
  getRegionDistribution: async (): Promise<RegionDistributionItem[]> => {
    const res = await apiClient.get<RegionDistributionItem[]>('/dashboard/region-distribution');
    return res.data;
  },
  getAgeing: async (): Promise<AgeingBucketItem[]> => {
    const res = await apiClient.get<AgeingBucketItem[]>('/dashboard/ageing');
    return res.data;
  },
  getTrends: async (): Promise<MonthlyTrendItem[]> => {
    const res = await apiClient.get<MonthlyTrendItem[]>('/dashboard/trends');
    return res.data;
  },
  getAutomationStats: async (): Promise<AutomationStats> => {
    const res = await apiClient.get<AutomationStats>('/dashboard/automation');
    return res.data;
  },
  getHotspots: async (limit = 8): Promise<Hotspots> => {
    const res = await apiClient.get<Hotspots>('/dashboard/hotspots', { params: { limit } });
    return res.data;
  },

  // --- Institutions ---
  getInstitutions: async (params?: {
    search?: string;
    region?: string;
    state?: string;
    institution_type?: string;
    risk_level?: string;
    has_overlap?: boolean;
    repeat_offender?: boolean;
    sort_by?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResult<Institution>> => {
    const res = await apiClient.get<PaginatedResult<Institution>>('/institutions', { params });
    return res.data;
  },
  getInstitution360: async (id: string): Promise<any> => {
    const res = await apiClient.get(`/institutions/${id}`);
    return res.data;
  },
  createInstitution: async (data: any): Promise<any> => {
    const res = await apiClient.post('/institutions', data);
    return res.data;
  },
  updateInstitution: async (id: string, data: any): Promise<any> => {
    const res = await apiClient.patch(`/institutions/${id}`, data);
    return res.data;
  },

  // --- Cases ---
  getCases: async (params?: {
    search?: string;
    bureau_id?: string;
    status?: string;
    priority?: string;
    category?: string;
    region?: string;
    overdue_only?: boolean;
    institution_id?: string;
    flag?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResult<Case>> => {
    const res = await apiClient.get<PaginatedResult<Case>>('/cases', { params });
    return res.data;
  },
  getCaseDetail: async (id: string): Promise<CaseDetail> => {
    const res = await apiClient.get<CaseDetail>(`/cases/${id}`);
    return res.data;
  },
  createCase: async (data: IntakePayload): Promise<IntakeResult> => {
    const res = await apiClient.post<IntakeResult>('/cases', data);
    return res.data;
  },
  previewIntake: async (data: Partial<IntakePayload>): Promise<IntakePreview> => {
    const res = await apiClient.post<IntakePreview>('/intake/preview', data);
    return res.data;
  },
  decideDuplicate: async (id: string, decision: 'CONFIRMED' | 'DISMISSED'): Promise<any> => {
    const res = await apiClient.post(`/cases/${id}/duplicate-decision`, { decision });
    return res.data;
  },
  closeCase: async (id: string): Promise<any> => {
    const res = await apiClient.post(`/cases/${id}/close`);
    return res.data;
  },
  updateCase: async (id: string, data: any): Promise<any> => {
    const res = await apiClient.patch(`/cases/${id}`, data);
    return res.data;
  },
  assignCase: async (id: string, data: { assigned_user_id: string; remarks: string; actor_user_id?: string }): Promise<any> => {
    const res = await apiClient.post(`/cases/${id}/assign`, data);
    return res.data;
  },
  transferCase: async (id: string, data: { destination_bureau_id: string; reason: string; actor_user_id?: string }): Promise<any> => {
    const res = await apiClient.post(`/cases/${id}/transfer`, data);
    return res.data;
  },
  escalateCase: async (id: string, data: { reason: string; actor_user_id?: string }): Promise<any> => {
    const res = await apiClient.post(`/cases/${id}/escalate`, data);
    return res.data;
  },
  disposeCase: async (id: string, data: { disposal_summary: string; resolution_type: string; actor_user_id?: string }): Promise<any> => {
    const res = await apiClient.post(`/cases/${id}/dispose`, data);
    return res.data;
  },
  getCaseActions: async (id: string): Promise<CaseAction[]> => {
    const res = await apiClient.get<CaseAction[]>(`/cases/${id}/actions`);
    return res.data;
  },

  // --- Overlap Alerts ---
  getOverlaps: async (params?: { status?: string; severity?: string; institution_id?: string }): Promise<OverlapAlert[]> => {
    const res = await apiClient.get<OverlapAlert[]>('/overlaps', { params });
    return res.data;
  },
  getOverlapDetail: async (id: string): Promise<OverlapAlert> => {
    const res = await apiClient.get<OverlapAlert>(`/overlaps/${id}`);
    return res.data;
  },
  triggerOverlapScan: async (): Promise<any> => {
    const res = await apiClient.post('/overlaps/scan');
    return res.data;
  },
  reviewOverlap: async (id: string, data: { remarks?: string; reviewer_id?: string }): Promise<any> => {
    const res = await apiClient.post(`/overlaps/${id}/review`, data);
    return res.data;
  },
  linkCases: async (id: string, data: { source_case_id: string; target_case_id: string; reason: string; lead_bureau_id?: string; actor_user_id?: string }): Promise<any> => {
    const res = await apiClient.post(`/overlaps/${id}/link-cases`, data);
    return res.data;
  },
  resolveOverlap: async (id: string, data: { resolution_reason: string; lead_bureau_id?: string; actor_user_id?: string }): Promise<any> => {
    const res = await apiClient.post(`/overlaps/${id}/resolve`, data);
    return res.data;
  },
  dismissOverlap: async (id: string, data: { justification: string; actor_user_id?: string }): Promise<any> => {
    const res = await apiClient.post(`/overlaps/${id}/dismiss`, data);
    return res.data;
  },

  // --- Matching Queue ---
  matchInstitution: async (data: { raw_name: string; aicte_permanent_id?: string }): Promise<any> => {
    const res = await apiClient.post('/matching/match', data);
    return res.data;
  },
  getMatchingReviewQueue: async (status: string = 'PENDING'): Promise<MatchingQueueItem[]> => {
    const res = await apiClient.get<MatchingQueueItem[]>('/matching/review-queue', { params: { decision_status: status } });
    return res.data;
  },
  reviewMatchingQueueItem: async (match_id: number, data: { decision: string; create_alias?: boolean; reviewer_id?: string }): Promise<any> => {
    const res = await apiClient.post(`/matching/${match_id}/review`, data);
    return res.data;
  },

  // --- Notifications ---
  getNotifications: async (params?: { user_id?: string; bureau_id?: string; limit?: number }): Promise<NotificationItem[]> => {
    const res = await apiClient.get<NotificationItem[]>('/alerts', { params });
    return res.data;
  },
  markNotificationRead: async (id: number): Promise<any> => {
    const res = await apiClient.patch(`/alerts/${id}/read`);
    return res.data;
  },
  runSlaScan: async (): Promise<any> => {
    const res = await apiClient.post('/alerts/run-sla-scan');
    return res.data;
  },

  // --- Bulk import ---
  uploadImport: async (file: File, opts: { source_bureau_id?: string; dry_run?: boolean }): Promise<ImportResult> => {
    const form = new FormData();
    form.append('file', file);
    if (opts.source_bureau_id) form.append('source_bureau_id', opts.source_bureau_id);
    form.append('dry_run', opts.dry_run ? 'true' : 'false');
    const res = await apiClient.post<ImportResult>('/imports/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getImportBatches: async (): Promise<ImportBatch[]> => {
    const res = await apiClient.get<ImportBatch[]>('/imports');
    return res.data;
  },
  downloadImportTemplate: async (): Promise<void> => {
    const res = await apiClient.get('/imports/template', { responseType: 'blob' });
    saveBlob(res.data, 'complaint_import_template.csv');
  },

  // --- Reports & Exports ---
  getReportsSummary: async (): Promise<any> => {
    const res = await apiClient.get('/reports/summary');
    return res.data;
  },
  getModelMetrics: async (): Promise<ModelMetrics> => {
    const res = await apiClient.get<ModelMetrics>('/reports/model-metrics');
    return res.data;
  },
  downloadExcelReport: async (): Promise<void> => {
    const res = await apiClient.get('/reports/export', { responseType: 'blob' });
    saveBlob(res.data, filenameFrom(res.headers['content-disposition'], 'AICTE_Complaint_Report.xlsx'));
  },
  getExportUrl: (): string => {
    return '/api/v1/reports/export';
  }
};

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
  PaginatedResult
} from '../types';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
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

  // --- Institutions ---
  getInstitutions: async (params?: {
    search?: string;
    region?: string;
    state?: string;
    institution_type?: string;
    risk_level?: string;
    has_overlap?: boolean;
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
  createCase: async (data: any): Promise<any> => {
    const res = await apiClient.post('/cases', data);
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

  // --- Reports & Exports ---
  getReportsSummary: async (): Promise<any> => {
    const res = await apiClient.get('/reports/summary');
    return res.data;
  },
  getExportUrl: (): string => {
    return '/api/v1/reports/export';
  }
};

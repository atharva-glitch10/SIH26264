import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
  Building2
} from 'lucide-react';
import { api } from '../services/api';
import { Case, PaginatedResult } from '../types';

export const Cases: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaginatedResult<Case>>({
    items: [],
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 1
  });

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [bureau, setBureau] = useState(searchParams.get('bureau') || 'ALL');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'ALL');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(searchParams.get('overdue') === 'true');
  const [page, setPage] = useState(1);

  // Register Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newCase, setNewCase] = useState({
    institution_id: 'INST-1001',
    category: 'Regulatory Compliance',
    priority: 'HIGH',
    source_bureau_id: 'BUR-RB',
    description: ''
  });
  const [registerSuccess, setRegisterSuccess] = useState('');

  useEffect(() => {
    loadCases();
  }, [search, bureau, status, priority, category, overdueOnly, page]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await api.getCases({
        search: search.trim() || undefined,
        bureau_id: bureau !== 'ALL' ? bureau : undefined,
        status: status !== 'ALL' ? status : undefined,
        priority: priority !== 'ALL' ? priority : undefined,
        category: category !== 'ALL' ? category : undefined,
        overdue_only: overdueOnly || undefined,
        page,
        page_size: 20
      });
      setData(res);
    } catch (e) {
      console.error('Failed to load cases', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCase.description.trim()) {
      alert('Please enter a complaint description');
      return;
    }
    try {
      const res = await api.createCase(newCase);
      setRegisterSuccess(`Registered complaint ${res.case_id} (${res.complaint_reference})`);
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegisterSuccess('');
        loadCases();
      }, 1200);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to register case');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AICTE Central Case Register</h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated master log of institutional complaints across Regulation Bureau (RB), PGRC, and other cells.
          </p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          File New Complaint Case
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Case ID (CASE-2026-...), Complaint Ref, College Name, or keywords..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Bureau Filter */}
            <select
              value={bureau}
              onChange={(e) => {
                setBureau(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Bureaus</option>
              <option value="BUR-RB">RB (Regulation Bureau)</option>
              <option value="BUR-PGRC">PGRC (Grievance Redressal)</option>
              <option value="BUR-APP">APPROVAL (Approval Bureau)</option>
              <option value="BUR-VIG">VIGILANCE (Vigilance Cell)</option>
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="PENDING">Pending Scrutiny</option>
              <option value="UNDER_PROCESS">Under Process</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="ESCALATED">Escalated</option>
              <option value="DISPOSED">Disposed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent (15d SLA)</option>
              <option value="HIGH">High (30d SLA)</option>
              <option value="MEDIUM">Medium (45d SLA)</option>
              <option value="LOW">Low (60d SLA)</option>
            </select>

            {/* Overdue Only Filter */}
            <button
              onClick={() => {
                setOverdueOnly(!overdueOnly);
                setPage(1);
              }}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                overdueOnly
                  ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Overdue SLA Only
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
          <span className="text-slate-400 font-semibold uppercase text-[10px]">Categories:</span>
          {[
            'ALL',
            'Academic and Examination',
            'Infrastructure and Facilities',
            'Faculty and Staffing',
            'Regulatory Compliance',
            'Admission Grievances',
            'Fee Related Grievances'
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-2 py-0.5 rounded-full transition-colors ${
                category === cat
                  ? 'bg-teal-700 text-white font-medium shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Case Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Case Reference / ID</th>
                <th className="py-3 px-4">Target Institution</th>
                <th className="py-3 px-4">Bureau / Officer</th>
                <th className="py-3 px-4">Category & Priority</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">SLA Deadline Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading cases...
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No cases match the specified filters.
                  </td>
                </tr>
              ) : (
                data.items.map((c) => (
                  <tr key={c.case_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <Link to={`/cases/${c.case_id}`} className="font-bold text-teal-700 hover:underline block">
                        {c.complaint_reference}
                      </Link>
                      <div className="text-[10px] text-slate-400">{c.case_id}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <Link
                        to={`/institutions/${c.institution_id}`}
                        className="font-medium text-slate-900 hover:text-teal-700 block truncate"
                        title={c.institution_name}
                      >
                        {c.institution_name}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {c.institution_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1 font-mono text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {c.current_bureau_id.replace('BUR-', '')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">{c.assigned_user_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{c.category}</div>
                      <span
                        className={`inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                          c.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-800'
                            : c.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                          c.status === 'UNDER_PROCESS'
                            ? 'bg-teal-100 text-teal-800'
                            : c.status === 'ESCALATED'
                            ? 'bg-rose-100 text-rose-800'
                            : c.status === 'TRANSFERRED'
                            ? 'bg-purple-100 text-purple-800'
                            : c.status === 'DISPOSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                            c.sla_status === 'OVERDUE'
                              ? 'bg-rose-500 text-white'
                              : c.sla_status === 'APPROACHING_DEADLINE'
                              ? 'bg-amber-500 text-white animate-pulse'
                              : c.sla_status === 'DISPOSED'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {c.sla_status === 'APPROACHING_DEADLINE' ? 'Due < 7 Days' : c.sla_status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Target: {new Date(c.expected_disposal_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/cases/${c.case_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                      >
                        Manage
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Page <strong>{data.page}</strong> of <strong>{data.total_pages}</strong> ({data.total} Total Complaints)
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={data.page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={data.page >= data.total_pages}
              onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
              className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Register Complaint Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                Register New Institution Complaint
              </h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-5 space-y-4">
              {registerSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  {registerSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institution ID *
                </label>
                <input
                  type="text"
                  required
                  value={newCase.institution_id}
                  onChange={(e) => setNewCase({ ...newCase, institution_id: e.target.value })}
                  placeholder="e.g. INST-1001"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Source Bureau</label>
                  <select
                    value={newCase.source_bureau_id}
                    onChange={(e) => setNewCase({ ...newCase, source_bureau_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    <option value="BUR-RB">Regulation Bureau (RB)</option>
                    <option value="BUR-PGRC">Public Grievance Cell (PGRC)</option>
                    <option value="BUR-APP">Approval Bureau</option>
                    <option value="BUR-VIG">Vigilance Cell</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority (SLA Window)</label>
                  <select
                    value={newCase.priority}
                    onChange={(e) => setNewCase({ ...newCase, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="URGENT">Urgent (15 Days)</option>
                    <option value="HIGH">High (30 Days)</option>
                    <option value="MEDIUM">Medium (45 Days)</option>
                    <option value="LOW">Low (60 Days)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Complaint Category</label>
                <select
                  value={newCase.category}
                  onChange={(e) => setNewCase({ ...newCase, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Academic and Examination">Academic and Examination</option>
                  <option value="Infrastructure and Facilities">Infrastructure and Facilities</option>
                  <option value="Faculty and Staffing">Faculty and Staffing</option>
                  <option value="Regulatory Compliance">Regulatory Compliance</option>
                  <option value="Admission Grievances">Admission Grievances</option>
                  <option value="Fee Related Grievances">Fee Related Grievances</option>
                  <option value="General Institutional">General Institutional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  placeholder="Summarize the core grievance / regulatory violation allegation..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
                >
                  Register Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

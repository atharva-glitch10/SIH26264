import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
<<<<<<< HEAD
import { Search, Plus, ChevronLeft, ChevronRight, AlertOctagon, Filter, ArrowRight } from 'lucide-react';
=======
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
import { api } from '../services/api';
import { Case, PaginatedResult } from '../types';
import { SmartIntakeModal } from '../components/case/SmartIntakeModal';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Tag, { TagTone } from '../components/ui/Tag';
import { Card } from '../components/ui/Card';
import { Table, THead, Th, Td, Tr } from '../components/ui/Table';

<<<<<<< HEAD
const selectClass =
  'h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 shadow-xs cursor-pointer';

const BUREAU_COLORS: Record<string, string> = {
  RB: 'bg-blue-50 text-blue-700 border-blue-200/80',
  PGRC: 'bg-purple-50 text-purple-700 border-purple-200/80',
  APP: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  APPROVAL: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  VIG: 'bg-rose-50 text-rose-700 border-rose-200/80',
  VIGILANCE: 'bg-rose-50 text-rose-700 border-rose-200/80',
};

const statusTone = (s: string): TagTone => {
  switch (s) {
    case 'UNDER_PROCESS':
      return 'info';
    case 'ESCALATED':
      return 'bad';
    case 'DISPOSED':
    case 'CLOSED':
      return 'ok';
    case 'PENDING':
    case 'RECEIVED':
      return 'warn';
    case 'TRANSFERRED':
      return 'info';
    default:
      return 'neutral';
  }
};

const slaTone = (s: string): TagTone =>
  s === 'OVERDUE' ? 'bad' : s === 'APPROACHING_DEADLINE' ? 'warn' : s === 'DISPOSED' ? 'ok' : 'ok';
=======
const selectClass = 'h-9 px-2.5 text-[13px] bg-white border border-line rounded-sm text-ink';

const statusTone = (s: string): TagTone =>
  s === 'DISPOSED' || s === 'CLOSED' ? 'ok' : 'neutral';

const slaTone = (s: string): TagTone =>
  s === 'OVERDUE' ? 'bad'
  : s === 'APPROACHING_DEADLINE' ? 'warn'
  : s === 'DISPOSED' ? 'ok'
  : 'neutral';
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

const priorityTone = (p: string): TagTone =>
  p === 'URGENT' ? 'bad' : p === 'HIGH' ? 'warn' : 'neutral';

export const Cases: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaginatedResult<Case>>({
    items: [],
    total: 0,
    page: 1,
    page_size: 20,
<<<<<<< HEAD
    total_pages: 1,
=======
    total_pages: 1
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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
  const [flag, setFlag] = useState(searchParams.get('flag') || 'ALL');

  useEffect(() => {
    loadCases();
  }, [search, bureau, status, priority, category, overdueOnly, flag, page]);

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
        flag: flag !== 'ALL' ? flag : undefined,
        page,
<<<<<<< HEAD
        page_size: 20,
=======
        page_size: 20
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      });
      setData(res);
    } catch (e) {
      console.error('Failed to load cases', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="AICTE Central Case Register"
<<<<<<< HEAD
        description="Consolidated master register of institutional complaints across Regulation Bureau (RB), PGRC, Approval, and Vigilance cells."
        actions={
          <Button onClick={() => setShowRegisterModal(true)} className="bg-slate-900 text-white hover:bg-slate-800 shadow-xs">
            <Plus className="w-4 h-4" />
=======
        description="Consolidated master log of institutional complaints across Regulation Bureau (RB), PGRC and other cells."
        actions={
          <Button onClick={() => setShowRegisterModal(true)}>
            <Plus className="w-3.5 h-3.5" />
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            File new complaint case
          </Button>
        }
      />

<<<<<<< HEAD
      {/* Filter and Search Toolbar */}
      <Card className="p-4 space-y-3.5">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
=======
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by case ID (CASE-2026-...), complaint ref, college name or keywords..."
<<<<<<< HEAD
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
=======
              className="w-full h-9 pl-9 pr-3 text-[13px] bg-white border border-line rounded-sm text-ink placeholder:text-muted"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            <select
              value={bureau}
              onChange={(e) => {
                setBureau(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="ALL">All Bureaus</option>
              <option value="BUR-RB">RB (Regulation Bureau)</option>
              <option value="BUR-PGRC">PGRC (Grievance Redressal)</option>
              <option value="BUR-APP">APPROVAL (Approval Bureau)</option>
              <option value="BUR-VIG">VIGILANCE (Vigilance Cell)</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="ALL">All Statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="PENDING">Pending Scrutiny</option>
              <option value="UNDER_PROCESS">Under Process</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="ESCALATED">Escalated</option>
              <option value="DISPOSED">Disposed</option>
            </select>

            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent (15d SLA)</option>
              <option value="HIGH">High (30d SLA)</option>
              <option value="MEDIUM">Medium (45d SLA)</option>
              <option value="LOW">Low (60d SLA)</option>
            </select>

            <select
              value={flag}
              onChange={(e) => {
                setFlag(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
<<<<<<< HEAD
              <option value="ALL">All Intake Flags</option>
              <option value="DUPLICATE">Possible Duplicates</option>
              <option value="PENDING_MATCH">Institution Needs Review</option>
              <option value="AUTO_CATEGORY">Auto-Categorised</option>
=======
              <option value="ALL">All intake flags</option>
              <option value="DUPLICATE">Possible duplicates</option>
              <option value="PENDING_MATCH">Institution needs review</option>
              <option value="AUTO_CATEGORY">Auto-categorised</option>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            </select>

            <button
              onClick={() => {
                setOverdueOnly(!overdueOnly);
                setPage(1);
              }}
              aria-pressed={overdueOnly}
<<<<<<< HEAD
              className={`h-9 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 shadow-xs ${
                overdueOnly
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
=======
              className={`h-9 px-3 text-[13px] font-medium rounded-sm border ${
                overdueOnly
                  ? 'bg-bad text-white border-bad'
                  : 'bg-white text-ink border-line hover:bg-page'
              }`}
            >
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              Overdue SLA only
            </button>
          </div>
        </div>

<<<<<<< HEAD
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
=======
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-line text-[12px]">
          <span className="text-muted mr-1">Categories:</span>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          {[
            'ALL',
            'Academic and Examination',
            'Infrastructure and Facilities',
            'Faculty and Staffing',
            'Regulatory Compliance',
            'Admission Grievances',
<<<<<<< HEAD
            'Fee Related Grievances',
=======
            'Fee Related Grievances'
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
<<<<<<< HEAD
              className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                category === cat
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
=======
              className={`px-2 py-1 rounded-sm border ${
                category === cat
                  ? 'bg-brand text-white border-brand font-medium'
                  : 'bg-white text-ink border-line hover:bg-page'
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              }`}
            >
              {cat === 'ALL' ? 'All categories' : cat}
            </button>
          ))}
        </div>
      </Card>

<<<<<<< HEAD
      {/* Cases Table */}
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      <Card className="overflow-hidden">
        <Table>
          <THead>
            <tr>
<<<<<<< HEAD
              <Th>Case Reference & ID</Th>
              <Th>Target Institution</Th>
              <Th>Bureau / Officer</Th>
              <Th>Category & Urgency</Th>
              <Th>Current Status</Th>
              <Th>SLA Deadline</Th>
=======
              <Th>Case reference / ID</Th>
              <Th>Target institution</Th>
              <Th>Bureau / officer</Th>
              <Th>Category and priority</Th>
              <Th>Current status</Th>
              <Th>SLA deadline status</Th>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              <Th align="right">Action</Th>
            </tr>
          </THead>
          <tbody>
            {loading ? (
              <tr>
<<<<<<< HEAD
                <Td colSpan={7} className="py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium">Loading register entries…</span>
                  </div>
=======
                <Td colSpan={7} className="py-12 text-center text-muted">
                  Loading cases...
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                </Td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
<<<<<<< HEAD
                <Td colSpan={7} className="py-16 text-center text-slate-500">
                  <p className="text-sm font-medium text-slate-700">No cases match the specified filters</p>
                  <p className="text-xs text-slate-400 mt-1">Try resetting search keywords or category filters</p>
                </Td>
              </tr>
            ) : (
              data.items.map((c) => {
                const bureauClean = c.current_bureau_id.replace('BUR-', '');
                const bureauBadgeStyle =
                  BUREAU_COLORS[bureauClean] || 'bg-slate-100 text-slate-700 border-slate-200';
                const isOverdue = c.sla_status === 'OVERDUE';

                return (
                  <Tr key={c.case_id}>
                    <Td>
                      <Link
                        to={`/cases/${c.case_id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 transition-colors font-mono text-xs block"
                      >
                        {c.complaint_reference}
                      </Link>
                      <span className="text-[11px] font-mono text-slate-400">{c.case_id}</span>
                    </Td>

                    <Td className="max-w-xs">
                      <Link
                        to={`/institutions/${c.institution_id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 transition-colors block truncate"
                        title={c.institution_name}
                      >
                        {c.institution_name}
                      </Link>
                      <span className="text-[11px] font-mono text-slate-400">ID: {c.institution_id}</span>
                    </Td>

                    <Td>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${bureauBadgeStyle}`}>
                        {bureauClean}
                      </span>
                      <div className="text-xs text-slate-600 mt-1 truncate">{c.assigned_user_name || 'Unassigned'}</div>
                    </Td>

                    <Td>
                      <div className="text-xs font-medium text-slate-900">{c.category}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Tag tone={priorityTone(c.priority)}>{c.priority}</Tag>
                        {c.category_source === 'AUTO' && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                            Auto {Math.round((c.category_confidence || 0) * 100)}%
                          </span>
                        )}
                        {c.duplicate_of_case_id && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                            Duplicate
                          </span>
                        )}
                        {c.institution_match_status === 'PENDING_REVIEW' && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                            Review Match
                          </span>
                        )}
                      </div>
                    </Td>

                    <Td>
                      <Tag tone={statusTone(c.status)}>{c.status.replace(/_/g, ' ')}</Tag>
                    </Td>

                    <Td>
                      <div className="flex items-center gap-1.5">
                        <Tag tone={slaTone(c.sla_status)}>
                          {c.sla_status === 'APPROACHING_DEADLINE' ? 'Due < 7 days' : c.sla_status.replace(/_/g, ' ')}
                        </Tag>
                      </div>
                      <div className={`text-[11px] mt-1 tabular-nums ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                        Target: {new Date(c.expected_disposal_at).toLocaleDateString()}
                      </div>
                    </Td>

                    <Td align="right">
                      <Link
                        to={`/cases/${c.case_id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                      >
                        Manage
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </Link>
                    </Td>
                  </Tr>
                );
              })
=======
                <Td colSpan={7} className="py-12 text-center text-muted">
                  No cases match the specified filters.
                </Td>
              </tr>
            ) : (
              data.items.map((c) => (
                <Tr key={c.case_id}>
                  <Td>
                    <Link to={`/cases/${c.case_id}`} className="font-medium block">
                      {c.complaint_reference}
                    </Link>
                    <div className="text-[12px] text-muted">{c.case_id}</div>
                  </Td>
                  <Td className="max-w-xs">
                    <Link
                      to={`/institutions/${c.institution_id}`}
                      className="font-medium block truncate"
                      title={c.institution_name}
                    >
                      {c.institution_name}
                    </Link>
                    <div className="text-[12px] text-muted">ID: {c.institution_id}</div>
                  </Td>
                  <Td>
                    <Tag>{c.current_bureau_id.replace('BUR-', '')}</Tag>
                    <div className="text-[12px] text-muted mt-1 truncate">{c.assigned_user_name}</div>
                  </Td>
                  <Td>
                    <div className="font-medium">{c.category}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Tag tone={priorityTone(c.priority)}>
                        {c.priority}
                      </Tag>
                      {c.category_source === 'AUTO' && (
                        <Tag tone="info" title="Category suggested by the classifier">
                          Suggested {Math.round((c.category_confidence || 0) * 100)}%
                        </Tag>
                      )}
                      {c.duplicate_of_case_id && (
                        <Tag tone="warn" title={`Possible duplicate of ${c.duplicate_of_case_id}`}>
                          Possible duplicate
                        </Tag>
                      )}
                      {c.institution_match_status === 'PENDING_REVIEW' && (
                        <Tag tone="warn" title="Institution link needs confirmation">
                          Link pending
                        </Tag>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <Tag tone={statusTone(c.status)}>{c.status}</Tag>
                  </Td>
                  <Td>
                    <Tag tone={slaTone(c.sla_status)}>
                      {c.sla_status === 'APPROACHING_DEADLINE' ? 'Due < 7 days' : c.sla_status}
                    </Tag>
                    <div className="text-[12px] text-muted mt-1">
                      Target: {new Date(c.expected_disposal_at).toLocaleDateString()}
                    </div>
                  </Td>
                  <Td align="right">
                    <Link to={`/cases/${c.case_id}`} className="text-brand hover:underline">
                      Manage
                    </Link>
                  </Td>
                </Tr>
              ))
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            )}
          </tbody>
        </Table>

<<<<<<< HEAD
        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div>
            Showing Page <span className="font-bold text-slate-900">{data.page}</span> of{' '}
            <span className="font-bold text-slate-900">{data.total_pages}</span> ({data.total} total cases)
          </div>
          <div className="flex items-center gap-1.5">
=======
        <div className="px-4 py-3 border-t border-line flex items-center justify-between text-[13px] text-muted">
          <div>
            Page <span className="font-medium text-ink">{data.page}</span> of{' '}
            <span className="font-medium text-ink">{data.total_pages}</span> ({data.total} total complaints)
          </div>
          <div className="flex items-center gap-1">
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            <Button
              variant="secondary"
              size="sm"
              aria-label="Previous page"
              disabled={data.page <= 1}
<<<<<<< HEAD
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2.5 bg-white"
            >
              <ChevronLeft className="w-4 h-4 mr-0.5" />
              Prev
=======
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            </Button>
            <Button
              variant="secondary"
              size="sm"
              aria-label="Next page"
              disabled={data.page >= data.total_pages}
<<<<<<< HEAD
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              className="h-8 px-2.5 bg-white"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-0.5" />
=======
              onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
            >
              <ChevronRight className="w-4 h-4" />
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            </Button>
          </div>
        </div>
      </Card>

<<<<<<< HEAD
      {/* File Case Modal */}
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      {showRegisterModal && (
        <SmartIntakeModal onClose={() => setShowRegisterModal(false)} onRegistered={loadCases} />
      )}
    </div>
  );
};
<<<<<<< HEAD

export default Cases;
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

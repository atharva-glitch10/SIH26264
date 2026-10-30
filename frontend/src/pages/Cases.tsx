import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { Case, PaginatedResult } from '../types';
import { SmartIntakeModal } from '../components/case/SmartIntakeModal';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Tag, { TagTone } from '../components/ui/Tag';
import { Card } from '../components/ui/Card';
import { Table, Th, Td, Tr } from '../components/ui/DataTable';

const selectClass = 'h-9 px-2.5 text-sm bg-surface border border-border rounded-sm text-ink';

const statusTone = (s: string): TagTone =>
  s === 'UNDER_PROCESS' ? 'info' : s === 'ESCALATED' ? 'danger' : s === 'DISPOSED' ? 'success' : s === 'PENDING' ? 'warning' : 'neutral';

const slaTone = (s: string): TagTone =>
  s === 'OVERDUE' ? 'danger' : s === 'APPROACHING_DEADLINE' ? 'warning' : s === 'DISPOSED' ? 'neutral' : 'success';

export const Cases: React.FC = () => {
  const [searchParams] = useSearchParams();
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
        page_size: 20
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
        description="Consolidated master log of institutional complaints across Regulation Bureau (RB), PGRC and other cells."
        actions={
          <Button onClick={() => setShowRegisterModal(true)}>
            <Plus className="w-3.5 h-3.5" />
            File new complaint case
          </Button>
        }
      />

      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by case ID (CASE-2026-...), complaint ref, college name or keywords..."
              className="w-full h-9 pl-9 pr-4 text-sm bg-surface border border-border rounded-sm text-ink"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
              <option value="ALL">All intake flags</option>
              <option value="DUPLICATE">Possible duplicates</option>
              <option value="PENDING_MATCH">Institution needs review</option>
              <option value="AUTO_CATEGORY">Auto-categorised</option>
            </select>

            <button
              onClick={() => {
                setOverdueOnly(!overdueOnly);
                setPage(1);
              }}
              aria-pressed={overdueOnly}
              className={`h-9 px-3 text-sm font-medium rounded-sm border ${
                overdueOnly
                  ? 'bg-danger text-white border-danger'
                  : 'bg-surface text-ink border-border hover:bg-page'
              }`}
            >
              Overdue SLA only
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-border text-xs">
          <span className="text-muted mr-1">Categories:</span>
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
              className={`px-2 py-1 rounded-sm border ${
                category === cat
                  ? 'bg-brand text-white border-brand font-medium'
                  : 'bg-surface text-ink border-border hover:bg-page'
              }`}
            >
              {cat === 'ALL' ? 'All categories' : cat}
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Case reference / ID</Th>
              <Th>Target institution</Th>
              <Th>Bureau / officer</Th>
              <Th>Category and priority</Th>
              <Th>Current status</Th>
              <Th>SLA deadline status</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted">
                  Loading cases...
                </td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted">
                  No cases match the specified filters.
                </td>
              </tr>
            ) : (
              data.items.map((c) => (
                <Tr key={c.case_id}>
                  <Td>
                    <Link to={`/cases/${c.case_id}`} className="font-medium block">
                      {c.complaint_reference}
                    </Link>
                    <div className="text-xs text-muted">{c.case_id}</div>
                  </Td>
                  <Td className="max-w-xs">
                    <Link
                      to={`/institutions/${c.institution_id}`}
                      className="font-medium block truncate"
                      title={c.institution_name}
                    >
                      {c.institution_name}
                    </Link>
                    <div className="text-xs text-muted">ID: {c.institution_id}</div>
                  </Td>
                  <Td>
                    <Tag>{c.current_bureau_id.replace('BUR-', '')}</Tag>
                    <div className="text-xs text-muted mt-1 truncate">{c.assigned_user_name}</div>
                  </Td>
                  <Td>
                    <div className="font-medium">{c.category}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Tag
                        tone={c.priority === 'URGENT' ? 'danger' : c.priority === 'HIGH' ? 'warning' : 'neutral'}
                      >
                        {c.priority}
                      </Tag>
                      {c.category_source === 'AUTO' && (
                        <Tag tone="info" title="Category suggested by the classifier">
                          Suggested · {Math.round((c.category_confidence || 0) * 100)}%
                        </Tag>
                      )}
                      {c.duplicate_of_case_id && (
                        <Tag tone="warning" title={`Possible duplicate of ${c.duplicate_of_case_id}`}>
                          Possible duplicate
                        </Tag>
                      )}
                      {c.institution_match_status === 'PENDING_REVIEW' && (
                        <Tag tone="warning" title="Institution link needs confirmation">
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
                    <div className="text-xs text-muted mt-1">
                      Target: {new Date(c.expected_disposal_at).toLocaleDateString()}
                    </div>
                  </Td>
                  <Td className="text-right">
                    <Link to={`/cases/${c.case_id}`} className="hover:underline">
                      Manage
                    </Link>
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>

        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-sm text-muted">
          <div>
            Page <span className="font-medium text-ink">{data.page}</span> of{' '}
            <span className="font-medium text-ink">{data.total_pages}</span> ({data.total} total complaints)
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              aria-label="Previous page"
              disabled={data.page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              aria-label="Next page"
              disabled={data.page >= data.total_pages}
              onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {showRegisterModal && (
        <SmartIntakeModal onClose={() => setShowRegisterModal(false)} onRegistered={loadCases} />
      )}
    </div>
  );
};

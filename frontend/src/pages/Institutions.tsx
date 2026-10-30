import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { Institution, PaginatedResult } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import Modal from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { Table, Th, Td, Tr } from '../components/ui/DataTable';
import { inputClass, labelClass, riskTone, selectClass, toggleClass } from '../components/ui/styles';

export const Institutions: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaginatedResult<Institution>>({
    items: [],
    total: 0,
    page: 1,
    page_size: 15,
    total_pages: 1
  });

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [region, setRegion] = useState(searchParams.get('region') || 'ALL');
  const [riskLevel, setRiskLevel] = useState(searchParams.get('risk_level') || 'ALL');
  const [hasOverlap, setHasOverlap] = useState<boolean | undefined>(
    searchParams.get('has_overlap') === 'true' ? true : undefined
  );
  const [repeatOnly, setRepeatOnly] = useState<boolean>(searchParams.get('repeat') === 'true');
  const [sortByRisk, setSortByRisk] = useState<boolean>(searchParams.get('sort') === 'risk');
  const [page, setPage] = useState(1);

  // Register Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newInst, setNewInst] = useState({
    canonical_name: '',
    aicte_permanent_id: '',
    institution_type: 'Autonomous Engineering College',
    region: 'Northern',
    state: 'Uttar Pradesh',
    district: 'Kanpur',
    address: '',
    contact_email: ''
  });
  const [registerSuccess, setRegisterSuccess] = useState('');

  useEffect(() => {
    loadInstitutions();
  }, [search, region, riskLevel, hasOverlap, repeatOnly, sortByRisk, page]);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const res = await api.getInstitutions({
        search: search.trim() || undefined,
        region: region !== 'ALL' ? region : undefined,
        risk_level: riskLevel !== 'ALL' ? riskLevel : undefined,
        has_overlap: hasOverlap,
        repeat_offender: repeatOnly || undefined,
        sort_by: sortByRisk ? 'risk' : undefined,
        page,
        page_size: 15
      });
      setData(res);
    } catch (e) {
      console.error('Failed to load institutions', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createInstitution(newInst);
      setRegisterSuccess(`Institution registered successfully (ID: ${res.institution_id})`);
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegisterSuccess('');
        loadInstitutions();
      }, 1200);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to register institution');
    }
  };

  const regionOptions = ['Northern', 'North-West', 'Eastern', 'Western', 'Southern', 'South-West', 'Central'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Technical Institutions Directory"
        description="Central repository of AICTE-approved institutions with consolidated multi-bureau grievance statistics."
        actions={
          <Button onClick={() => setShowRegisterModal(true)}>
            <Plus className="w-3.5 h-3.5" />
            Register new institution
          </Button>
        }
      />

      <Card className="p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by college name, AICTE permanent ID (e.g. 1-4329811) or INST ID..."
            className="w-full h-9 pl-9 pr-4 text-sm bg-surface border border-border rounded-sm text-ink"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="ALL">All Regions</option>
            {regionOptions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={riskLevel}
            onChange={(e) => {
              setRiskLevel(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="ALL">All Attention Levels</option>
            <option value="HIGH">High Attention (Multi-Bureau / Overdue)</option>
            <option value="MEDIUM">Medium Attention</option>
            <option value="LOW">Low Attention</option>
          </select>

          <button
            onClick={() => {
              setHasOverlap(hasOverlap ? undefined : true);
              setPage(1);
            }}
            aria-pressed={!!hasOverlap}
            className={toggleClass(!!hasOverlap)}
          >
            Active overlap only
          </button>

          <button
            onClick={() => {
              setRepeatOnly(!repeatOnly);
              setPage(1);
            }}
            aria-pressed={repeatOnly}
            className={toggleClass(repeatOnly)}
          >
            Repeat offenders
          </button>

          <button
            onClick={() => {
              setSortByRisk(!sortByRisk);
              setPage(1);
            }}
            aria-pressed={sortByRisk}
            className={toggleClass(sortByRisk)}
          >
            Sort by risk score
          </button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Permanent ID / internal ID</Th>
              <Th>Canonical institution name</Th>
              <Th>Region and state</Th>
              <Th>Active / overdue cases</Th>
              <Th>Connected bureaus</Th>
              <Th>Attention level</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted">Loading institutions directory...</td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted">No institutions match the filter criteria.</td>
              </tr>
            ) : (
              data.items.map((inst) => (
                <Tr key={inst.institution_id}>
                  <Td>
                    <div className="font-medium">{inst.aicte_permanent_id || 'PENDING'}</div>
                    <div className="text-xs text-muted">{inst.institution_id}</div>
                  </Td>
                  <Td>
                    <Link to={`/institutions/${inst.institution_id}`} className="font-medium block">
                      {inst.canonical_name}
                    </Link>
                    <span className="text-xs text-muted">{inst.institution_type}</span>
                  </Td>
                  <Td>
                    <div>{inst.region} Region</div>
                    <div className="text-xs text-muted">{inst.state}</div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="font-medium tabular-nums">{inst.active_cases_count} active</span>
                      {inst.overdue_cases_count > 0 && <Tag tone="danger">{inst.overdue_cases_count} overdue</Tag>}
                    </div>
                    <div className="text-xs text-muted mt-0.5">{inst.pending_cases_count} awaiting scrutiny</div>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {inst.participating_bureaus && inst.participating_bureaus.length > 0 ? (
                        inst.participating_bureaus.map((b) => <Tag key={b}>{b.replace('BUR-', '')}</Tag>)
                      ) : (
                        <span className="text-muted text-xs">None</span>
                      )}
                    </div>
                    {inst.has_active_overlap && (
                      <div className="mt-1">
                        <Tag tone="warning">Overlap alert active</Tag>
                      </div>
                    )}
                  </Td>
                  <Td>
                    <Tag tone={riskTone(inst.risk_level)}>
                      {inst.risk_level} · {inst.risk_score ?? 0}
                    </Tag>
                    {inst.is_repeat_offender && <div className="mt-1 text-xs font-medium text-danger">Repeat offender</div>}
                    {inst.risk_factors && inst.risk_factors.length > 0 && (
                      <div className="mt-0.5 text-xs text-muted max-w-[220px] truncate" title={inst.risk_factors.join('\n')}>
                        {inst.risk_factors[0]}
                      </div>
                    )}
                  </Td>
                  <Td className="text-right">
                    <Link to={`/institutions/${inst.institution_id}`} className="hover:underline">
                      Institution 360
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
            <span className="font-medium text-ink">{data.total_pages}</span> ({data.total} institutions)
          </div>
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" aria-label="Previous page" disabled={data.page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm" aria-label="Next page" disabled={data.page >= data.total_pages} onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register new institution profile"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowRegisterModal(false)}>Cancel</Button>
            <Button type="submit" form="form-register-inst">Confirm registration</Button>
          </>
        }
      >
        <form id="form-register-inst" onSubmit={handleRegister} className="space-y-4">
          {registerSuccess && (
            <div className="p-3 rounded-sm bg-success/10 border border-success/30 text-sm text-success">{registerSuccess}</div>
          )}

          <div>
            <label className={labelClass}>Canonical institution name *</label>
            <input
              type="text"
              required
              value={newInst.canonical_name}
              onChange={(e) => setNewInst({ ...newInst, canonical_name: e.target.value })}
              placeholder="e.g. National Institute of Technical Sciences"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>AICTE permanent ID</label>
              <input
                type="text"
                value={newInst.aicte_permanent_id}
                onChange={(e) => setNewInst({ ...newInst, aicte_permanent_id: e.target.value })}
                placeholder="e.g. 1-4829104"
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className={labelClass}>Institution type</label>
              <select
                value={newInst.institution_type}
                onChange={(e) => setNewInst({ ...newInst, institution_type: e.target.value })}
                className={inputClass}
              >
                <option value="Autonomous Engineering College">Autonomous Engineering College</option>
                <option value="Technical University">Technical University</option>
                <option value="Affiliated Engineering College">Affiliated Engineering College</option>
                <option value="Polytechnic Institute">Polytechnic Institute</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Region</label>
              <select value={newInst.region} onChange={(e) => setNewInst({ ...newInst, region: e.target.value })} className={inputClass}>
                {regionOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input
                type="text"
                required
                value={newInst.state}
                onChange={(e) => setNewInst({ ...newInst, state: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Official contact email</label>
            <input
              type="email"
              value={newInst.contact_email}
              onChange={(e) => setNewInst({ ...newInst, contact_email: e.target.value })}
              placeholder="registrar@college.ac.in"
              className={inputClass}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

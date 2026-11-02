import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
<<<<<<< HEAD
import { Search, Plus, ChevronLeft, ChevronRight, Building2, ChevronRight as ArrowRight, Check } from 'lucide-react';
=======
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
import { api } from '../services/api';
import { Institution, PaginatedResult } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import Modal from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { Table, THead, Th, Td, Tr } from '../components/ui/Table';

<<<<<<< HEAD
const inputClass =
  'w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 shadow-xs';
const labelClass = 'block text-xs font-semibold text-slate-700 mb-1.5';
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
=======
const inputClass = 'w-full h-9 px-3 text-[13px] bg-white border border-line rounded-sm text-ink placeholder:text-muted';
const labelClass = 'block text-[12px] font-medium text-ink mb-1';
const selectClass = 'h-9 px-2.5 text-[13px] bg-white border border-line rounded-sm text-ink';
const toggleClass = (active: boolean) =>
  `h-9 px-3 text-[13px] font-medium rounded-sm border ${
    active ? 'bg-brand text-white border-brand' : 'bg-white text-ink border-line hover:bg-page'
  }`;

const riskLabel = (level?: string) =>
  level ? level.charAt(0) + level.slice(1).toLowerCase() : 'Unknown';
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

export const Institutions: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaginatedResult<Institution>>({
    items: [],
    total: 0,
    page: 1,
    page_size: 15,
<<<<<<< HEAD
    total_pages: 1,
=======
    total_pages: 1
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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
<<<<<<< HEAD
    contact_email: '',
=======
    contact_email: ''
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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
<<<<<<< HEAD
        page_size: 15,
=======
        page_size: 15
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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
<<<<<<< HEAD
        description="Central repository of AICTE-approved technical institutions with consolidated multi-bureau grievance statistics."
        actions={
          <Button onClick={() => setShowRegisterModal(true)} className="bg-slate-900 text-white hover:bg-slate-800 shadow-xs">
            <Plus className="w-4 h-4" />
=======
        description="Central repository of AICTE-approved institutions with consolidated multi-bureau grievance statistics."
        actions={
          <Button onClick={() => setShowRegisterModal(true)}>
            <Plus className="w-3.5 h-3.5" />
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            Register new institution
          </Button>
        }
      />

<<<<<<< HEAD
      {/* Filter Toolbar */}
      <Card className="p-4 flex flex-col lg:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
=======
      <Card className="p-4 flex flex-col md:flex-row items-center gap-3">
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
            placeholder="Search by college name, AICTE permanent ID (e.g. 1-4329811) or INST ID..."
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
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="ALL">All Regions</option>
<<<<<<< HEAD
            {regionOptions.map((r) => (
              <option key={r} value={r}>
                {r} Region
              </option>
            ))}
=======
            {regionOptions.map((r) => <option key={r} value={r}>{r}</option>)}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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
<<<<<<< HEAD
            className={`h-9 px-3 text-xs font-semibold rounded-lg border transition-all select-none shadow-xs ${
              hasOverlap
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
=======
            className={toggleClass(!!hasOverlap)}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          >
            Active overlap only
          </button>

          <button
            onClick={() => {
              setRepeatOnly(!repeatOnly);
              setPage(1);
            }}
            aria-pressed={repeatOnly}
<<<<<<< HEAD
            className={`h-9 px-3 text-xs font-semibold rounded-lg border transition-all select-none shadow-xs ${
              repeatOnly
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
=======
            className={toggleClass(repeatOnly)}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          >
            Repeat offenders
          </button>

          <button
            onClick={() => {
              setSortByRisk(!sortByRisk);
              setPage(1);
            }}
            aria-pressed={sortByRisk}
<<<<<<< HEAD
            className={`h-9 px-3 text-xs font-semibold rounded-lg border transition-all select-none shadow-xs ${
              sortByRisk
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
=======
            className={toggleClass(sortByRisk)}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          >
            Sort by risk score
          </button>
        </div>
      </Card>

<<<<<<< HEAD
      {/* Table */}
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      <Card className="overflow-hidden">
        <Table>
          <THead>
            <tr>
<<<<<<< HEAD
              <Th>Permanent ID & Code</Th>
              <Th>Canonical Institution Name</Th>
              <Th>Region & State</Th>
              <Th align="right">Active / Overdue Cases</Th>
              <Th>Connected Bureaus</Th>
              <Th>Attention Level</Th>
=======
              <Th>Permanent ID / internal ID</Th>
              <Th>Canonical institution name</Th>
              <Th>Region and state</Th>
              <Th align="right">Active / overdue cases</Th>
              <Th>Connected bureaus</Th>
              <Th>Attention level</Th>
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
                    <span className="text-xs font-medium">Loading technical institutions directory…</span>
                  </div>
                </Td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <Td colSpan={7} className="py-16 text-center text-slate-500">
                  <p className="text-sm font-medium text-slate-700">No institutions match the filter criteria</p>
                  <p className="text-xs text-slate-400 mt-1">Try resetting search keywords or region filters</p>
                </Td>
=======
                <Td colSpan={7} className="py-12 text-center text-muted">Loading institutions directory...</Td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <Td colSpan={7} className="py-12 text-center text-muted">No institutions match the filter criteria.</Td>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              </tr>
            ) : (
              data.items.map((inst) => (
                <Tr key={inst.institution_id}>
                  <Td>
<<<<<<< HEAD
                    <div className="font-mono font-semibold text-xs text-slate-900">
                      {inst.aicte_permanent_id || 'PENDING'}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{inst.institution_id}</div>
                  </Td>

                  <Td>
                    <Link
                      to={`/institutions/${inst.institution_id}`}
                      className="font-semibold text-slate-900 hover:text-blue-600 transition-colors block text-xs"
                    >
                      {inst.canonical_name}
                    </Link>
                    <div className="text-[11px] text-slate-500 mt-0.5">{inst.institution_type}</div>
                  </Td>

                  <Td>
                    <div className="text-xs font-medium text-slate-800">{inst.region} Region</div>
                    <div className="text-[11px] text-slate-500">{inst.state}</div>
                  </Td>

                  <Td align="right" className="tabular-nums">
                    <span className="font-bold text-slate-900">{inst.active_cases_count} active</span>
                    {inst.overdue_cases_count > 0 && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        {inst.overdue_cases_count} overdue
                      </span>
                    )}
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {inst.pending_cases_count} awaiting scrutiny
                    </div>
                  </Td>

                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {inst.participating_bureaus && inst.participating_bureaus.length > 0 ? (
                        inst.participating_bureaus.map((b) => {
                          const cleanB = b.replace('BUR-', '');
                          const color = BUREAU_COLORS[cleanB] || 'bg-slate-100 text-slate-700 border-slate-200';
                          return (
                            <span key={b} className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${color}`}>
                              {cleanB}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[11px] text-slate-400">None</span>
=======
                    <div className="font-medium">{inst.aicte_permanent_id || 'PENDING'}</div>
                    <div className="text-[12px] text-muted">{inst.institution_id}</div>
                  </Td>
                  <Td>
                    <Link to={`/institutions/${inst.institution_id}`} className="font-medium block text-brand hover:underline">
                      {inst.canonical_name}
                    </Link>
                    <span className="text-[12px] text-muted">{inst.institution_type}</span>
                  </Td>
                  <Td>
                    <div>{inst.region} Region</div>
                    <div className="text-[12px] text-muted">{inst.state}</div>
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium tabular-nums">{inst.active_cases_count} active</span>
                      {inst.overdue_cases_count > 0 && <Tag tone="bad">{inst.overdue_cases_count} overdue</Tag>}
                    </div>
                    <div className="text-[12px] text-muted mt-0.5">{inst.pending_cases_count} awaiting scrutiny</div>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {inst.participating_bureaus && inst.participating_bureaus.length > 0 ? (
                        inst.participating_bureaus.map((b) => <Tag key={b}>{b.replace('BUR-', '')}</Tag>)
                      ) : (
                        <span className="text-muted text-[12px]">None</span>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                      )}
                    </div>
                    {inst.has_active_overlap && (
                      <div className="mt-1">
<<<<<<< HEAD
                        <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Overlap Alert Active
                        </span>
                      </div>
                    )}
                  </Td>

                  <Td>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          inst.risk_level === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                            : inst.risk_level === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        }`}
                      >
                        {inst.risk_level} · {inst.risk_score}
                      </span>
                    </div>
                    {inst.is_repeat_offender && (
                      <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200">
                        Repeat offender
                      </span>
                    )}
                  </Td>

                  <Td align="right">
                    <Link
                      to={`/institutions/${inst.institution_id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                    >
                      Institution 360
                      <ArrowRight className="w-3 h-3 text-slate-400" />
=======
                        <Tag tone="warn">Overlap alert active</Tag>
                      </div>
                    )}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-1">
                      <Tag tone={inst.risk_level === 'HIGH' ? 'bad' : inst.risk_level === 'MEDIUM' ? 'warn' : 'ok'}>
                        {riskLabel(inst.risk_level)} · {inst.risk_score ?? 0}
                      </Tag>
                      {inst.is_repeat_offender && <Tag tone="bad">Repeat offender</Tag>}
                    </div>
                    {inst.risk_factors && inst.risk_factors.length > 0 && (
                      <div className="mt-0.5 text-[12px] text-muted max-w-[220px] truncate" title={inst.risk_factors.join('\n')}>
                        {inst.risk_factors[0]}
                      </div>
                    )}
                  </Td>
                  <Td align="right">
                    <Link to={`/institutions/${inst.institution_id}`} className="text-brand hover:underline">
                      Institution 360
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                    </Link>
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>

<<<<<<< HEAD
        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div>
            Showing Page <span className="font-bold text-slate-900">{data.page}</span> of{' '}
            <span className="font-bold text-slate-900">{data.total_pages}</span> ({data.total} institutions)
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={data.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2.5 bg-white"
            >
              <ChevronLeft className="w-4 h-4 mr-0.5" />
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={data.page >= data.total_pages}
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              className="h-8 px-2.5 bg-white"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-0.5" />
=======
        <div className="px-4 py-3 border-t border-line flex items-center justify-between text-[13px] text-muted">
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
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            </Button>
          </div>
        </div>
      </Card>

<<<<<<< HEAD
      {/* Register New Institution Modal */}
      <Modal open={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register Technical Institution">
        <form onSubmit={handleRegister} className="space-y-4">
          {registerSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4" />
              {registerSuccess}
            </div>
          )}
          <div>
            <label className={labelClass}>Canonical Institution Name</label>
            <input
              value={newInst.canonical_name}
              onChange={(e) => setNewInst({ ...newInst, canonical_name: e.target.value })}
              className={inputClass}
              placeholder="e.g. Aryabhata Institute of Technology"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>AICTE Permanent ID</label>
              <input
                value={newInst.aicte_permanent_id}
                onChange={(e) => setNewInst({ ...newInst, aicte_permanent_id: e.target.value })}
                className={inputClass}
                placeholder="e.g. 1-4329811"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Institution Type</label>
              <select
                value={newInst.institution_type}
                onChange={(e) => setNewInst({ ...newInst, institution_type: e.target.value })}
                className={selectClass}
              >
                <option value="Autonomous Engineering College">Autonomous Engineering College</option>
                <option value="Affiliated Engineering College">Affiliated Engineering College</option>
                <option value="Polytechnic Institute">Polytechnic Institute</option>
                <option value="Management and Technology Institute">Management & Technology Institute</option>
                <option value="Technical University">Technical University</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Region</label>
              <select
                value={newInst.region}
                onChange={(e) => setNewInst({ ...newInst, region: e.target.value })}
                className={selectClass}
              >
                {regionOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
=======
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
            <div className="p-3 rounded-sm bg-ok/5 border border-ok/30 text-[13px] text-ok">{registerSuccess}</div>
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
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              </select>
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input
<<<<<<< HEAD
                value={newInst.state}
                onChange={(e) => setNewInst({ ...newInst, state: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>District</label>
              <input
                value={newInst.district}
                onChange={(e) => setNewInst({ ...newInst, district: e.target.value })}
                className={inputClass}
                required
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Postal Address</label>
            <input
              value={newInst.address}
              onChange={(e) => setNewInst({ ...newInst, address: e.target.value })}
              className={inputClass}
              placeholder="Campus address, city, pin code..."
            />
          </div>
          <div>
            <label className={labelClass}>Official Contact Email</label>
=======
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
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            <input
              type="email"
              value={newInst.contact_email}
              onChange={(e) => setNewInst({ ...newInst, contact_email: e.target.value })}
<<<<<<< HEAD
              className={inputClass}
              placeholder="principal@institution.edu.in"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowRegisterModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Registration</Button>
          </div>
=======
              placeholder="registrar@college.ac.in"
              className={inputClass}
            />
          </div>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
        </form>
      </Modal>
    </div>
  );
};
<<<<<<< HEAD

export default Institutions;
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

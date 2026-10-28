import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { Institution, PaginatedResult } from '../types';

export const Institutions: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  }, [search, region, riskLevel, hasOverlap, page]);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const res = await api.getInstitutions({
        search: search.trim() || undefined,
        region: region !== 'ALL' ? region : undefined,
        risk_level: riskLevel !== 'ALL' ? riskLevel : undefined,
        has_overlap: hasOverlap,
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Technical Institutions Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Central repository of AICTE-approved institutions with consolidated multi-bureau grievance statistics.
          </p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Register New Institution
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by college name, AICTE Permanent ID (e.g. 1-4329811), or INST ID..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Region */}
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Regions</option>
            <option value="Northern">Northern</option>
            <option value="North-West">North-West</option>
            <option value="Eastern">Eastern</option>
            <option value="Western">Western</option>
            <option value="Southern">Southern</option>
            <option value="South-West">South-West</option>
            <option value="Central">Central</option>
          </select>

          {/* Risk Level */}
          <select
            value={riskLevel}
            onChange={(e) => {
              setRiskLevel(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Attention Levels</option>
            <option value="HIGH">High Attention (Multi-Bureau / Overdue)</option>
            <option value="MEDIUM">Medium Attention</option>
            <option value="LOW">Low Attention</option>
          </select>

          {/* Overlap Filter Toggle */}
          <button
            onClick={() => {
              setHasOverlap(hasOverlap ? undefined : true);
              setPage(1);
            }}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              hasOverlap
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Active Overlap Only
          </button>
        </div>
      </div>

      {/* Table Listing */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Permanent ID / Internal ID</th>
                <th className="py-3 px-4">Canonical Institution Name</th>
                <th className="py-3 px-4">Region & State</th>
                <th className="py-3 px-4">Active / Overdue Cases</th>
                <th className="py-3 px-4">Connected Bureaus</th>
                <th className="py-3 px-4">Attention Level</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading institutions directory...
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching institutions found matching filter criteria.
                  </td>
                </tr>
              ) : (
                data.items.map((inst) => (
                  <tr key={inst.institution_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-semibold text-slate-800">{inst.aicte_permanent_id || 'PENDING'}</div>
                      <div className="text-[10px] text-slate-400">{inst.institution_id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/institutions/${inst.institution_id}`}
                        className="font-semibold text-slate-900 hover:text-teal-700 block"
                      >
                        {inst.canonical_name}
                      </Link>
                      <span className="text-[11px] text-slate-500">{inst.institution_type}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{inst.region} Region</div>
                      <div className="text-[11px] text-slate-400">{inst.state}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{inst.active_cases_count} Active</span>
                        {inst.overdue_cases_count > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold text-[10px]">
                            {inst.overdue_cases_count} Overdue
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {inst.pending_cases_count} awaiting scrutiny
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {inst.participating_bureaus && inst.participating_bureaus.length > 0 ? (
                          inst.participating_bureaus.map((b) => (
                            <span
                              key={b}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-medium"
                            >
                              {b.replace('BUR-', '')}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px]">None</span>
                        )}
                      </div>
                      {inst.has_active_overlap && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-amber-700">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Overlap Alert Active
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                          inst.risk_level === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : inst.risk_level === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {inst.risk_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/institutions/${inst.institution_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                      >
                        Dossier 360°
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing Page <strong>{data.page}</strong> of <strong>{data.total_pages}</strong> ({data.total} Institutions)
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

      {/* Register Institution Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-400" />
                Register New Institution Profile
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
                  Canonical Institution Name *
                </label>
                <input
                  type="text"
                  required
                  value={newInst.canonical_name}
                  onChange={(e) => setNewInst({ ...newInst, canonical_name: e.target.value })}
                  placeholder="e.g. National Institute of Technical Sciences"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">AICTE Permanent ID</label>
                  <input
                    type="text"
                    value={newInst.aicte_permanent_id}
                    onChange={(e) => setNewInst({ ...newInst, aicte_permanent_id: e.target.value })}
                    placeholder="e.g. 1-4829104"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Type</label>
                  <select
                    value={newInst.institution_type}
                    onChange={(e) => setNewInst({ ...newInst, institution_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Region</label>
                  <select
                    value={newInst.region}
                    onChange={(e) => setNewInst({ ...newInst, region: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Northern">Northern</option>
                    <option value="North-West">North-West</option>
                    <option value="Eastern">Eastern</option>
                    <option value="Western">Western</option>
                    <option value="Southern">Southern</option>
                    <option value="South-West">South-West</option>
                    <option value="Central">Central</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newInst.state}
                    onChange={(e) => setNewInst({ ...newInst, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Contact Email</label>
                <input
                  type="email"
                  value={newInst.contact_email}
                  onChange={(e) => setNewInst({ ...newInst, contact_email: e.target.value })}
                  placeholder="registrar@college.ac.in"
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
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

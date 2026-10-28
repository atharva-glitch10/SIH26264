import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Flame,
  Building2,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

import { api } from '../services/api';
import {
  DashboardSummary,
  BureauWorkloadItem,
  StatusDistributionItem,
  RegionDistributionItem,
  AgeingBucketItem,
  MonthlyTrendItem,
  Institution
} from '../types';

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: '#94A3B8',
  PENDING: '#F59E0B',
  UNDER_PROCESS: '#0D9488',
  TRANSFERRED: '#8B5CF6',
  ESCALATED: '#EF4444',
  DISPOSED: '#10B981',
  CLOSED: '#64748B'
};

export const Overview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [workload, setWorkload] = useState<BureauWorkloadItem[]>([]);
  const [statusDist, setStatusDist] = useState<StatusDistributionItem[]>([]);
  const [regionDist, setRegionDist] = useState<RegionDistributionItem[]>([]);
  const [ageing, setAgeing] = useState<AgeingBucketItem[]>([]);
  const [trends, setTrends] = useState<MonthlyTrendItem[]>([]);
  const [multiBureauInsts, setMultiBureauInsts] = useState<Institution[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sum, work, status, reg, age, tr, insts] = await Promise.all([
        api.getDashboardSummary(),
        api.getBureauWorkload(),
        api.getStatusDistribution(),
        api.getRegionDistribution(),
        api.getAgeing(),
        api.getTrends(),
        api.getInstitutions({ has_overlap: true, page_size: 5 })
      ]);
      setSummary(sum);
      setWorkload(work);
      setStatusDist(status);
      setRegionDist(reg);
      setAgeing(age);
      setTrends(tr);
      setMultiBureauInsts(insts.items);
    } catch (e) {
      console.error('Failed to load dashboard metrics', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
        <span className="text-sm font-medium">Aggregating Central AICTE Grievance & Regulatory Metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Centralized Institution Monitoring Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated real-time institutional grievance tracking, inter-bureau coordination, and SLA enforcement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Refresh Metrics
          </button>
          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm transition-colors"
          >
            Download Excel Report
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Cross-Bureau Overlap Callout Alert */}
      {summary && summary.unresolved_overlap_alerts > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                Potential Overlapping Cases — Coordination Required ({summary.unresolved_overlap_alerts} Active Alerts)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Multiple active complaints regarding the same institutions are concurrently assigned across Regulation Bureau (RB), PGRC, and other cells.
              </p>
            </div>
          </div>
          <Link
            to="/overlaps"
            className="shrink-0 px-3.5 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-sm transition-colors flex items-center gap-1.5"
          >
            Review Overlap Hub
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Cases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Complaints</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary?.total_cases.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-slate-500">Across 60 monitored technical colleges</div>
        </div>

        {/* Card 2: Under Process */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Under Process</span>
            <RefreshCw className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-teal-700">{summary?.under_process_cases.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-slate-500">Active hearings & inspections</div>
        </div>

        {/* Card 3: Pending / Scrutiny */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Scrutiny</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{summary?.pending_cases.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-slate-500">Awaiting officer allocation</div>
        </div>

        {/* Card 4: Disposed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Disposed / Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{summary?.disposed_cases.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">With recorded disposal findings</div>
        </div>

        {/* Card 5: Inter-Bureau Transferred */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Transferred</span>
            <ArrowRightLeft className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-700">{summary?.transferred_cases.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-slate-500">Cross-bureau handovers</div>
        </div>

        {/* Card 6: Escalated */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Escalated</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700">{summary?.escalated_cases.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-slate-500">Under Senior Management review</div>
        </div>

        {/* Card 7: Overdue Cases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overdue SLA</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">{summary?.overdue_cases.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-rose-600">Past target resolution date</div>
        </div>

        {/* Card 8: Multi-Bureau Scrutiny */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Multi-Bureau Colleges</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary?.multi_bureau_institutions_count}</div>
          <div className="mt-1 text-[11px] text-slate-500">Colleges split across ≥2 Bureaus</div>
        </div>
      </div>

      {/* Row 2: Charts (Bureau Workload & Status Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bureau Workload Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Workload by Bureau / Cell</h3>
              <p className="text-xs text-slate-500">Distribution of active vs disposed matters per AICTE division</p>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">Real DB Aggregation</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workload} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bureau_code" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="under_process_cases" name="Under Process" fill="#0D9488" stackId="a" />
                <Bar dataKey="pending_cases" name="Pending Scrutiny" fill="#F59E0B" stackId="a" />
                <Bar dataKey="escalated_cases" name="Escalated" fill="#EF4444" stackId="a" />
                <Bar dataKey="disposed_cases" name="Disposed" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Case Status Distribution Donut Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900">Status Distribution</h3>
            <p className="text-xs text-slate-500">Proportion of cases across workflow stages</p>
          </div>
          <div className="h-56 relative flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDist}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {statusDist.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[10px]">
            {statusDist.map((s) => (
              <div key={s.status} className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] }} />
                <span className="truncate">{s.status}:</span>
                <span className="font-semibold text-slate-800">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Ageing Analysis & Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Case Ageing Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pending Case Ageing Analysis</h3>
              <p className="text-xs text-slate-500">Active unresolved cases grouped by pending duration</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageing} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" name="Cases" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Received vs Disposed Trends */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Received vs Disposed</h3>
              <p className="text-xs text-slate-500">Historical trend over the last 12 months</p>
            </div>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="received" name="Received" stroke="#0D9488" fill="#0D9488" fillOpacity={0.15} />
                <Area type="monotone" dataKey="disposed" name="Disposed" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Multi-Bureau Hotspot Institutions Preview */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">High Attention Institutions (Concurrent Multi-Bureau Activity)</h3>
            <p className="text-xs text-slate-500">Institutions with concurrent active cases requiring inter-bureau coordination</p>
          </div>
          <Link to="/institutions?has_overlap=true" className="text-xs text-teal-600 font-semibold hover:underline flex items-center gap-1">
            View All Institutions
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Institution Name & Permanent ID</th>
                <th className="py-2.5 px-3">Region / State</th>
                <th className="py-2.5 px-3">Active Cases</th>
                <th className="py-2.5 px-3">Bureaus Involved</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {multiBureauInsts.map((inst) => (
                <tr key={inst.institution_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <Link to={`/institutions/${inst.institution_id}`} className="font-semibold text-slate-900 hover:text-teal-700">
                      {inst.canonical_name}
                    </Link>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      PID: {inst.aicte_permanent_id || 'N/A'} • ID: {inst.institution_id}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <div>{inst.region} Region</div>
                    <div className="text-[11px] text-slate-500">{inst.state}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800">{inst.active_cases_count} Active</span>
                    {inst.overdue_cases_count > 0 && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-medium">
                        {inst.overdue_cases_count} Overdue
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {inst.participating_bureaus?.map((b) => (
                        <span key={b} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-medium">
                          {b.replace('BUR-', '')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        inst.risk_level === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : inst.risk_level === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {inst.risk_level} Attention
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/institutions/${inst.institution_id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      Institution 360
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

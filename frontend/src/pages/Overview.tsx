import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  Layers,
  Clock,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  TrendingUp,
  AlertOctagon,
  Building2,
  ChevronRight,
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
  AreaChart,
  Area,
} from 'recharts';

import { api } from '../services/api';
import { useT } from '../i18n';
import { SmartAutomationPanels } from '../components/dashboard/SmartAutomationPanels';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Tag from '../components/ui/Tag';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, THead, Th, Td, Tr } from '../components/ui/Table';
import {
  DashboardSummary,
  BureauWorkloadItem,
  StatusDistributionItem,
  RegionDistributionItem,
  AgeingBucketItem,
  MonthlyTrendItem,
  Institution,
} from '../types';

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: '#94A3B8',
  PENDING: '#F59E0B',
  UNDER_PROCESS: '#2563EB',
  TRANSFERRED: '#8B5CF6',
  ESCALATED: '#EF4444',
  DISPOSED: '#10B981',
  CLOSED: '#64748B',
};

const BUREAU_COLORS: Record<string, string> = {
  BUR_RB: 'bg-blue-50 text-blue-700 border-blue-200/80',
  BUR_PGRC: 'bg-purple-50 text-purple-700 border-purple-200/80',
  BUR_APP: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  BUR_VIG: 'bg-rose-50 text-rose-700 border-rose-200/80',
};

const GRID = '#F1F5F9';
const AXIS = { fontSize: 11, fill: '#94A3B8' };

export const Overview: React.FC = () => {
  const { t } = useT();
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
        api.getInstitutions({ has_overlap: true, page_size: 5 }),
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
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Loading dashboard metrics…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <PageHeader
        title={t('overview.title')}
        description="Consolidated institutional grievance tracking, inter-bureau coordination, and SLA enforcement."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={loadDashboardData}>
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh metrics
            </Button>
            <Link
              to="/reports"
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Download Excel report
            </Link>
          </>
        }
      />

      {/* Critical Overlap Alerts Banner */}
      {summary && summary.unresolved_overlap_alerts > 0 && (
        <div className="p-4 rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 font-heading">
                  Concurrent Multi-Bureau Overlap Alerts
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white">
                  {summary.unresolved_overlap_alerts} active
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Multiple active complaints about the same technical institutions are concurrently under process across Regulation Bureau (RB), PGRC, and other cells.
              </p>
            </div>
          </div>
          <Link
            to="/overlaps"
            className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/60 shadow-2xs transition-colors"
          >
            Review overlap hub
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={t('overview.total')}
          value={summary?.total_cases.toLocaleString()}
          helper="Across 60 monitored technical colleges"
          icon={<Layers className="w-4 h-4 text-slate-700" />}
        />
        <StatCard
          label={t('overview.underProcess')}
          value={summary?.under_process_cases.toLocaleString()}
          helper="Active hearings and inspections"
          icon={<Clock className="w-4 h-4 text-blue-600" />}
        />
        <StatCard
          label={t('overview.pending')}
          value={summary?.pending_cases.toLocaleString()}
          helper="Awaiting officer allocation"
          tone="warn"
          icon={<AlertCircle className="w-4 h-4 text-amber-600" />}
        />
        <StatCard
          label={t('overview.disposed')}
          value={summary?.disposed_cases.toLocaleString()}
          helper="With recorded disposal findings"
          tone="ok"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <StatCard
          label={t('overview.transferred')}
          value={summary?.transferred_cases.toLocaleString()}
          helper="Cross-bureau handovers"
          icon={<GitBranch className="w-4 h-4 text-purple-600" />}
        />
        <StatCard
          label={t('overview.escalated')}
          value={summary?.escalated_cases.toLocaleString()}
          helper="Under senior management review"
          tone="bad"
          icon={<TrendingUp className="w-4 h-4 text-rose-600" />}
        />
        <StatCard
          label={t('overview.overdue')}
          value={summary?.overdue_cases.toLocaleString()}
          helper="Past statutory resolution deadline"
          tone="bad"
          icon={<AlertOctagon className="w-4 h-4 text-rose-600" />}
        />
        <StatCard
          label={t('overview.multiBureau')}
          value={summary?.multi_bureau_institutions_count}
          helper="Colleges split across 2 or more Bureaus"
          icon={<Building2 className="w-4 h-4 text-indigo-600" />}
        />
      </div>

      {/* Automation and Risk Intelligence */}
      <SmartAutomationPanels />

      {/* Main Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title={t('overview.workload')}
            description="Active and disposed matters categorized per AICTE division"
          />
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workload} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="bureau_code" tick={AXIS} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                  <Bar dataKey="under_process_cases" name="Under process" fill="#2563EB" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending_cases" name="Pending scrutiny" fill="#CBD5E1" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="escalated_cases" name="Escalated" fill="#EF4444" stackId="a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="disposed_cases" name="Disposed" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title={t('overview.statusDistribution')}
            description="Proportion of cases across workflow stages"
          />
          <CardBody className="flex flex-col flex-1">
            <div className="h-56 relative flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDist}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke="#FFFFFF"
                  >
                    {statusDist.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94A3B8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px]">
              {statusDist.map((s) => (
                <div key={s.status} className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[s.status] }} />
                  <span className="truncate">{s.status}:</span>
                  <span className="font-bold text-slate-900 ml-auto tabular-nums">{s.count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Ageing Analysis & Historical Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title={t('overview.ageing')}
            description="Active unresolved cases grouped by pending duration"
          />
          <CardBody>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageing} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="bucket" tick={AXIS} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Cases" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={t('overview.monthly')}
            description="Historical intake vs resolution trend over last 12 months"
          />
          <CardBody>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E293B" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1E293B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDisposed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="month" tick={AXIS} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="received"
                    name="Received"
                    stroke="#1E293B"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReceived)"
                  />
                  <Area
                    type="monotone"
                    dataKey="disposed"
                    name="Disposed"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDisposed)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* High Attention Institutions Table */}
      <Card>
        <CardHeader
          title={t('overview.highAttention')}
          description="Institutions with active multi-bureau investigations requiring synchronized action"
          actions={
            <Link
              to="/institutions?has_overlap=true"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              View all institutions
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <Table>
          <THead>
            <tr>
              <Th>Institution Name & Permanent ID</Th>
              <Th>Region / State</Th>
              <Th align="right">Active Cases</Th>
              <Th>Connected Bureaus</Th>
              <Th>Risk Level</Th>
              <Th align="right">Action</Th>
            </tr>
          </THead>
          <tbody>
            {multiBureauInsts.map((inst) => (
              <Tr key={inst.institution_id}>
                <Td>
                  <Link
                    to={`/institutions/${inst.institution_id}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {inst.canonical_name}
                  </Link>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                      PID: {inst.aicte_permanent_id || 'N/A'}
                    </span>
                    <span>·</span>
                    <span className="font-mono">{inst.institution_id}</span>
                  </div>
                </Td>
                <Td>
                  <div className="text-slate-800 font-medium">{inst.region} Region</div>
                  <div className="text-xs text-slate-500">{inst.state}</div>
                </Td>
                <Td align="right" className="tabular-nums">
                  <span className="font-bold text-slate-900">{inst.active_cases_count}</span>
                  {inst.overdue_cases_count > 0 && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                      {inst.overdue_cases_count} overdue
                    </span>
                  )}
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {inst.participating_bureaus?.map((b) => {
                      const cleanB = b.replace('BUR-', '');
                      const colorClass =
                        BUREAU_COLORS[`BUR_${cleanB}`] || 'bg-slate-100 text-slate-700 border-slate-200';
                      return (
                        <span
                          key={b}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorClass}`}
                        >
                          {cleanB}
                        </span>
                      );
                    })}
                  </div>
                </Td>
                <Td>
                  <Tag tone={inst.risk_level === 'HIGH' ? 'bad' : inst.risk_level === 'MEDIUM' ? 'warn' : 'ok'}>
                    {inst.risk_level} Attention
                  </Tag>
                </Td>
                <Td align="right">
                  <Link
                    to={`/institutions/${inst.institution_id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                  >
                    Institution 360
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </Link>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default Overview;

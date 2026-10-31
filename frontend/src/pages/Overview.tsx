import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
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
  Area
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
  Institution
} from '../types';

const CHART_COLORS = ['#1F3A5F', '#6B8BB5', '#A9BCD6', '#2F7D4F', '#A36A00', '#B42318'];

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: CHART_COLORS[2],
  PENDING: CHART_COLORS[4],
  UNDER_PROCESS: CHART_COLORS[0],
  TRANSFERRED: CHART_COLORS[1],
  ESCALATED: CHART_COLORS[5],
  DISPOSED: CHART_COLORS[3],
  CLOSED: '#5A6472'
};

const GRID = '#E5E9EF';
const AXIS = { fontSize: 12, fill: '#5A6472' };
const TOOLTIP = {
  backgroundColor: '#FFFFFF',
  color: '#1A202C',
  border: '1px solid #D9DEE5',
  borderRadius: '4px',
  fontSize: '12px'
};

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted">
        <RefreshCw className="w-5 h-5 animate-spin text-brand" />
        <span className="text-[13px]">Loading dashboard metrics…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={t('overview.title')}
        description="Consolidated institutional grievance tracking, inter-bureau coordination and SLA monitoring."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={loadDashboardData}>
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh metrics
            </Button>
            <Link
              to="/reports"
              className="inline-flex items-center h-8 px-3 text-[13px] font-medium rounded-sm bg-brand text-white hover:bg-brand-hover"
            >
              Download Excel report
            </Link>
          </>
        }
      />

      {summary && summary.unresolved_overlap_alerts > 0 && (
        <div className="p-4 rounded-md border border-warn/30 bg-warn/5 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-[13px] font-semibold text-ink">
              Potential overlapping cases — coordination required ({summary.unresolved_overlap_alerts} active alerts)
            </h4>
            <p className="text-[13px] text-muted mt-0.5">
              Multiple active complaints about the same institutions are assigned across Regulation Bureau (RB), PGRC and other cells.
            </p>
          </div>
          <Link
            to="/overlaps"
            className="shrink-0 inline-flex items-center h-8 px-3 text-[13px] font-medium rounded-sm border border-line bg-white text-ink hover:bg-page"
          >
            Review overlap hub
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t('overview.total')} value={summary?.total_cases.toLocaleString()} helper="Across 60 monitored technical colleges" />
        <StatCard label={t('overview.underProcess')} value={summary?.under_process_cases.toLocaleString()} helper="Active hearings and inspections" />
        <StatCard label={t('overview.pending')} value={summary?.pending_cases.toLocaleString()} helper="Awaiting officer allocation" />
        <StatCard label={t('overview.disposed')} value={summary?.disposed_cases.toLocaleString()} helper="With recorded disposal findings" />
        <StatCard label={t('overview.transferred')} value={summary?.transferred_cases.toLocaleString()} helper="Cross-bureau handovers" />
        <StatCard label={t('overview.escalated')} value={summary?.escalated_cases.toLocaleString()} helper="Under senior management review" />
        <StatCard label={t('overview.overdue')} value={summary?.overdue_cases.toLocaleString()} helper="Past target resolution date" tone="bad" />
        <StatCard label={t('overview.multiBureau')} value={summary?.multi_bureau_institutions_count} helper="Colleges split across 2 or more Bureaus" />
      </div>

      <SmartAutomationPanels />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title={t('overview.workload')} />
          <CardBody>
            <p className="text-[13px] text-muted mb-3">Active and disposed matters per AICTE division</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workload} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke={GRID} vertical={false} />
                  <XAxis dataKey="bureau_code" tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="under_process_cases" name="Under process" fill="#1F3A5F" stackId="a" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="pending_cases" name="Pending scrutiny" fill="#A9BCD6" stackId="a" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="escalated_cases" name="Escalated" fill="#B42318" stackId="a" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="disposed_cases" name="Disposed" fill="#6B8BB5" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card className="flex flex-col">
          <CardHeader title={t('overview.statusDistribution')} />
          <CardBody className="flex flex-col flex-1">
            <p className="text-[13px] text-muted">Proportion of cases across workflow stages</p>
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
                    paddingAngle={1}
                    stroke="#FFFFFF"
                  >
                    {statusDist.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || CHART_COLORS[2]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-line text-[12px]">
              {statusDist.map((s) => (
                <div key={s.status} className="flex items-center gap-1.5 text-muted">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: STATUS_COLORS[s.status] }} />
                  <span className="truncate">{s.status}:</span>
                  <span className="font-medium text-ink">{s.count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title={t('overview.ageing')} />
          <CardBody>
            <p className="text-[13px] text-muted mb-3">Active unresolved cases grouped by pending duration</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageing} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke={GRID} vertical={false} />
                  <XAxis dataKey="bucket" tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Bar dataKey="count" name="Cases" fill="#6B8BB5" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t('overview.monthly')} />
          <CardBody>
            <p className="text-[13px] text-muted mb-3">Historical trend over the last 12 months</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke={GRID} vertical={false} />
                  <XAxis dataKey="month" tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="received" name="Received" stroke="#1F3A5F" strokeWidth={1.5} fill="#1F3A5F" fillOpacity={0.08} />
                  <Area type="monotone" dataKey="disposed" name="Disposed" stroke="#6B8BB5" strokeWidth={1.5} fill="#6B8BB5" fillOpacity={0.08} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title={t('overview.highAttention')}
          actions={
            <Link to="/institutions?has_overlap=true" className="text-[13px] text-brand hover:underline">
              View all institutions
            </Link>
          }
        />
        <Table>
          <THead>
            <tr>
              <Th>Institution name and permanent ID</Th>
              <Th>Region / State</Th>
              <Th align="right">Active cases</Th>
              <Th>Bureaus involved</Th>
              <Th>Risk level</Th>
              <Th align="right">Actions</Th>
            </tr>
          </THead>
          <tbody>
            {multiBureauInsts.map((inst) => (
              <Tr key={inst.institution_id}>
                <Td>
                  <Link to={`/institutions/${inst.institution_id}`} className="font-medium">
                    {inst.canonical_name}
                  </Link>
                  <div className="text-[12px] text-muted mt-0.5">
                    PID: {inst.aicte_permanent_id || 'N/A'} · ID: {inst.institution_id}
                  </div>
                </Td>
                <Td>
                  <div>{inst.region} Region</div>
                  <div className="text-[12px] text-muted">{inst.state}</div>
                </Td>
                <Td align="right" className="tabular-nums">
                  <span className="font-medium">{inst.active_cases_count}</span>
                  {inst.overdue_cases_count > 0 && (
                    <Tag tone="bad" className="ml-2">{inst.overdue_cases_count} overdue</Tag>
                  )}
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {inst.participating_bureaus?.map((b) => (
                      <Tag key={b}>{b.replace('BUR-', '')}</Tag>
                    ))}
                  </div>
                </Td>
                <Td>
                  <Tag tone={inst.risk_level === 'HIGH' ? 'bad' : inst.risk_level === 'MEDIUM' ? 'warn' : 'ok'}>
                    {inst.risk_level} attention
                  </Tag>
                </Td>
                <Td align="right">
                  <Link to={`/institutions/${inst.institution_id}`} className="text-brand hover:underline">
                    Institution 360
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

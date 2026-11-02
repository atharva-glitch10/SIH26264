import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
import { RefreshCw, ArrowUpRight, AlertTriangle, Building, MapPin, Zap } from 'lucide-react';
=======
import { RefreshCw } from 'lucide-react';
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AutomationStats, Hotspots } from '../../types';
import { Card, CardHeader, CardBody } from '../ui/Card';
<<<<<<< HEAD
import Button from '../ui/Button';
import Tag from '../ui/Tag';

const Tile: React.FC<{ label: string; value: React.ReactNode; to?: string; hint?: string }> = ({
  label,
  value,
  to,
  hint,
}) => {
  const content = (
    <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all duration-150 group">
      <div className="flex items-start justify-between gap-1">
        <p className="text-[11px] font-medium text-slate-500 line-clamp-1">{label}</p>
        {to && <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-heading text-lg font-bold text-slate-900 tracking-tight">{value}</span>
      </div>
      {hint && <p className="mt-0.5 text-[10px] text-slate-500 truncate">{hint}</p>}
    </div>
  );

  return to ? (
    <Link to={to} className="block">
      {content}
    </Link>
  ) : (
    content
  );
=======
import { StatCard } from '../ui/StatCard';
import Button from '../ui/Button';
import Tag from '../ui/Tag';

const Tile: React.FC<{ label: string; value: React.ReactNode; to?: string; hint?: string }> = ({ label, value, to, hint }) => {
  const body = <StatCard label={label} value={value} helper={hint} />;
  return to ? <Link to={to} className="block hover:border-brand">{body}</Link> : body;
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
};

export const SmartAutomationPanels: React.FC = () => {
  const { can } = useAuth();
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [hot, setHot] = useState<Hotspots | null>(null);
  const [scanning, setScanning] = useState(false);

  const load = () => {
    api.getAutomationStats().then(setStats).catch(() => setStats(null));
    api.getHotspots(6).then(setHot).catch(() => setHot(null));
  };
  useEffect(load, []);

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await api.runSlaScan();
<<<<<<< HEAD
      const created = Object.values(res.notifications_created || {}).reduce(
        (a: number, b: any) => a + Number(b),
        0
      );
=======
      const created = Object.values(res.notifications_created || {}).reduce((a: number, b: any) => a + Number(b), 0);
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      alert(`SLA monitor: ${created} new alert(s), ${res.auto_escalated?.length || 0} auto-escalation(s).`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'SLA scan failed');
    } finally {
      setScanning(false);
    }
  };

  const maxState = Math.max(1, ...(hot?.states.slice(0, 8).map((s) => s.active_cases) || [1]));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
<<<<<<< HEAD
      {/* Automation Summary */}
      <Card>
        <CardHeader
          title="Automation Summary"
          description="Autonomous ingestion and classification engine"
          actions={
            can('sla:run') && (
              <Button variant="secondary" size="sm" onClick={runScan} disabled={scanning} className="text-xs">
                <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                Run SLA scan
=======
      <Card>
        <CardHeader
          title="Automation Summary"
          actions={
            can('sla:run') && (
              <Button variant="ghost" size="sm" onClick={runScan} disabled={scanning}>
                <RefreshCw className={`w-3 h-3 ${scanning ? 'animate-spin' : ''}`} /> Run SLA scan
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              </Button>
            )
          }
        />
<<<<<<< HEAD
        <CardBody className="space-y-3.5">
          {stats ? (
            <div className="grid grid-cols-2 gap-2.5">
              <Tile label="Auto-matched to institution" value={stats.auto_linked_institutions} />
              <Tile label="Links awaiting review" value={stats.pending_institution_review} to="/data-quality" />
              <Tile
                label="Auto-categorised"
                value={stats.auto_categorized}
                hint={stats.avg_category_confidence != null ? `avg confidence ${stats.avg_category_confidence}%` : undefined}
                to="/cases?flag=AUTO_CATEGORY"
              />
=======
        <CardBody className="space-y-3">
          {stats ? (
            <div className="grid grid-cols-2 gap-3">
              <Tile label="Auto-matched to institution" value={stats.auto_linked_institutions} />
              <Tile label="Links awaiting review" value={stats.pending_institution_review} to="/data-quality" />
              <Tile label="Auto-categorised" value={stats.auto_categorized}
                    hint={stats.avg_category_confidence != null ? `avg confidence ${stats.avg_category_confidence}%` : undefined} to="/cases?flag=AUTO_CATEGORY" />
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              <Tile label="Possible duplicates" value={stats.duplicates_flagged} to="/cases?flag=DUPLICATE" />
              <Tile label="Open SLA alerts" value={stats.sla_alerts_open} />
              <Tile label="Auto-escalated by SLA" value={stats.auto_escalated} />
            </div>
          ) : (
<<<<<<< HEAD
            <div className="text-xs text-slate-500 py-4 text-center">Loading automation metrics…</div>
          )}
          {stats && stats.intake_channels.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Intake channels:</span>
              {stats.intake_channels.map((c) => (
                <span key={c.channel} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {c.channel.replace(/_/g, ' ').toLowerCase()}: <strong className="font-bold">{c.count}</strong>
                </span>
              ))}
=======
            <div className="text-[13px] text-muted">Loading…</div>
          )}
          {stats && stats.intake_channels.length > 0 && (
            <div className="text-[12px] text-muted">
              Intake channels:{' '}
              {stats.intake_channels.map((c) => `${c.channel.replace(/_/g, ' ').toLowerCase()} ${c.count}`).join(' · ')}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            </div>
          )}
        </CardBody>
      </Card>

<<<<<<< HEAD
      {/* Highest-risk institutions */}
      <Card>
        <CardHeader
          title="Highest-Risk Institutions"
          description="Prioritized institutional oversight"
          actions={
            hot && (
              <Link to="/institutions?sort=risk" className="text-xs font-semibold text-blue-600 hover:underline">
=======
      <Card>
        <CardHeader
          title="Highest-risk institutions"
          actions={
            hot && (
              <Link to="/institutions?sort=risk" className="text-[13px] text-brand hover:underline">
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                {hot.repeat_offenders_count} repeat offenders
              </Link>
            )
          }
        />
<<<<<<< HEAD
        <CardBody className="space-y-2.5">
          {hot?.top_institutions.map((i) => (
            <Link
              key={i.institution_id}
              to={`/institutions/${i.institution_id}`}
              className="block p-2.5 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70 transition-all duration-150 group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {i.canonical_name}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    i.risk_level === 'HIGH'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                      : i.risk_level === 'MEDIUM'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                  }`}
                >
                  Score: {i.risk_score}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-1">
                {i.is_repeat_offender && (
                  <span className="text-rose-600 font-semibold mr-1">Repeat offender ·</span>
                )}
                <span>{i.risk_factors.join(' · ')}</span>
=======
        <CardBody className="space-y-2">
          {hot?.top_institutions.map((i) => (
            <Link key={i.institution_id} to={`/institutions/${i.institution_id}`} className="block p-2 rounded-sm border border-line hover:bg-page">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-ink truncate">{i.canonical_name}</span>
                <Tag tone={i.risk_level === 'HIGH' ? 'bad' : i.risk_level === 'MEDIUM' ? 'warn' : 'ok'}>
                  {i.risk_score}
                </Tag>
              </div>
              <div className="text-[12px] text-muted truncate">
                {i.is_repeat_offender && <span className="text-bad font-medium">Repeat offender · </span>}
                {i.risk_factors.join(' · ')}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              </div>
            </Link>
          ))}
        </CardBody>
      </Card>

<<<<<<< HEAD
      {/* State Hotspots */}
      <Card>
        <CardHeader title="State Hotspots" description="Geographical distribution of active complaints" />
        <CardBody className="space-y-3">
          {hot?.states.slice(0, 8).map((s) => (
            <div key={s.state} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-700 truncate">
                  {s.state} <span className="text-slate-400 font-normal">({s.region})</span>
                </span>
                <span className="font-semibold text-slate-900 tabular-nums shrink-0 ml-2">
                  {s.active_cases}
                  {s.overdue_cases > 0 && (
                    <span className="text-rose-600 font-bold ml-1">({s.overdue_cases} overdue)</span>
                  )}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${(s.active_cases / maxState) * 100}%` }}
                />
=======
      <Card>
        <CardHeader title="State hotspots (active cases)" />
        <CardBody className="space-y-2">
          {hot?.states.slice(0, 8).map((s) => (
            <div key={s.state} className="text-[12px]">
              <div className="flex justify-between text-muted">
                <span>{s.state} <span>· {s.region}</span></span>
                <span className="font-medium text-ink tabular-nums">
                  {s.active_cases}
                  {s.overdue_cases > 0 && <span className="text-bad font-normal"> ({s.overdue_cases} overdue)</span>}
                </span>
              </div>
              <div className="h-1.5 bg-page rounded-sm">
                <div className="h-1.5 rounded-sm bg-brand" style={{ width: `${(s.active_cases / maxState) * 100}%` }} />
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
};
<<<<<<< HEAD

export default SmartAutomationPanels;
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

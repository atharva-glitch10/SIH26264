import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AutomationStats, Hotspots } from '../../types';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Tag from '../ui/Tag';

const Tile: React.FC<{ label: string; value: React.ReactNode; to?: string; hint?: string }> = ({ label, value, to, hint }) => {
  const body = (
    <div className="p-3 rounded-sm bg-page border border-border hover:border-brand-accent h-full">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-xl font-semibold text-ink mt-1 tabular-nums">{value}</div>
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
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
      const created = Object.values(res.notifications_created || {}).reduce((a: number, b: any) => a + Number(b), 0);
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
      <Card>
        <CardHeader
          title="Automation Summary"
          actions={
            can('sla:run') && (
              <button onClick={runScan} disabled={scanning} className="text-sm text-brand-accent inline-flex items-center gap-1 hover:underline">
                <RefreshCw className={`w-3 h-3 ${scanning ? 'animate-spin' : ''}`} /> Run SLA scan
              </button>
            )
          }
        />
        <CardBody className="space-y-3">
          {stats ? (
            <div className="grid grid-cols-2 gap-2">
              <Tile label="Auto-matched to institution" value={stats.auto_linked_institutions} />
              <Tile label="Links awaiting review" value={stats.pending_institution_review} to="/data-quality" />
              <Tile label="Auto-categorised" value={stats.auto_categorized}
                    hint={stats.avg_category_confidence != null ? `avg confidence ${stats.avg_category_confidence}%` : undefined} to="/cases?flag=AUTO_CATEGORY" />
              <Tile label="Possible duplicates" value={stats.duplicates_flagged} to="/cases?flag=DUPLICATE" />
              <Tile label="Open SLA alerts" value={stats.sla_alerts_open} />
              <Tile label="Auto-escalated by SLA" value={stats.auto_escalated} />
            </div>
          ) : (
            <div className="text-sm text-muted">Loading…</div>
          )}
          {stats && stats.intake_channels.length > 0 && (
            <div className="text-xs text-muted">
              Intake channels:{' '}
              {stats.intake_channels.map((c) => `${c.channel.replace(/_/g, ' ').toLowerCase()} ${c.count}`).join(' · ')}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Highest-risk institutions"
          actions={
            hot && (
              <Link to="/institutions?sort=risk" className="text-sm hover:underline">
                {hot.repeat_offenders_count} repeat offenders
              </Link>
            )
          }
        />
        <CardBody className="space-y-2">
          {hot?.top_institutions.map((i) => (
            <Link key={i.institution_id} to={`/institutions/${i.institution_id}`} className="block p-2 rounded-sm border border-border hover:bg-page">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink truncate">{i.canonical_name}</span>
                <Tag tone={i.risk_level === 'HIGH' ? 'danger' : i.risk_level === 'MEDIUM' ? 'warning' : 'success'}>
                  {i.risk_score}
                </Tag>
              </div>
              <div className="text-xs text-muted truncate">
                {i.is_repeat_offender && <span className="text-danger font-medium">Repeat offender · </span>}
                {i.risk_factors.join(' · ')}
              </div>
            </Link>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="State hotspots (active cases)" />
        <CardBody className="space-y-2">
          {hot?.states.slice(0, 8).map((s) => (
            <div key={s.state} className="text-xs">
              <div className="flex justify-between text-muted">
                <span>{s.state} <span>· {s.region}</span></span>
                <span className="font-medium text-ink tabular-nums">
                  {s.active_cases}
                  {s.overdue_cases > 0 && <span className="text-danger font-normal"> ({s.overdue_cases} overdue)</span>}
                </span>
              </div>
              <div className="h-1.5 bg-page rounded-sm">
                <div className="h-1.5 rounded-sm bg-brand" style={{ width: `${(s.active_cases / maxState) * 100}%` }} />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
};

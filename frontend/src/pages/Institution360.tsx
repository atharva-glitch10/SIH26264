import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
<<<<<<< HEAD
import {
  Building2,
  Calendar,
  AlertTriangle,
  Layers,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
import { api } from '../services/api';
import { Institution, Case, CaseAction, OverlapAlert } from '../types';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Tag from '../components/ui/Tag';
import EmptyState from '../components/ui/EmptyState';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { priorityTone, riskTone, statusTone } from '../components/ui/styles';

<<<<<<< HEAD
const BUREAU_COLORS: Record<string, string> = {
  RB: 'bg-blue-50 text-blue-700 border-blue-200/80',
  PGRC: 'bg-purple-50 text-purple-700 border-purple-200/80',
  APP: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  APPROVAL: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  VIG: 'bg-rose-50 text-rose-700 border-rose-200/80',
  VIGILANCE: 'bg-rose-50 text-rose-700 border-rose-200/80',
};

=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
export const Institution360: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    institution: Institution;
    aliases: any[];
    cases: Case[];
    overlap_alerts: OverlapAlert[];
    timeline: CaseAction[];
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadInstitutionDossier(id);
    }
  }, [id]);

  const loadInstitutionDossier = async (instId: string) => {
    setLoading(true);
    try {
      const res = await api.getInstitution360(instId);
      setData(res);
    } catch (e) {
      console.error('Failed to load institution 360', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
<<<<<<< HEAD
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium">Loading institution profile and grievance history…</span>
      </div>
    );
=======
    return <div className="flex items-center justify-center min-h-[50vh] text-[13px] text-muted">Loading institution profile and case history…</div>;
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
  }

  if (!data) {
    return (
      <EmptyState
        title="Institution not found"
<<<<<<< HEAD
        action={
          <Link to="/institutions" className="text-xs font-semibold text-blue-600 hover:underline">
            Return to directory
          </Link>
        }
=======
        action={<Link to="/institutions" className="text-[13px] text-brand hover:underline">Return to directory</Link>}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      />
    );
  }

  const { institution, aliases, cases, overlap_alerts, timeline } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={institution.canonical_name}
<<<<<<< HEAD
        breadcrumb={
          <Link to="/institutions" className="hover:text-blue-600 flex items-center gap-1 font-medium transition-colors">
            ← Technical Institutions Directory
          </Link>
        }
        description={
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-slate-600 font-medium">
              {institution.institution_type} · {institution.region} Region
            </span>
            <Tag tone={riskTone(institution.risk_level)}>Risk {institution.risk_score ?? 0} / 100</Tag>
            {institution.is_repeat_offender && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                Repeat offender
              </span>
            )}
          </div>
=======
        breadcrumb={<Link to="/institutions" className="hover:underline">Institutions</Link>}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>{institution.institution_type} · {institution.region} Region</span>
            <Tag tone={riskTone(institution.risk_level)}>Risk {institution.risk_score ?? 0} / 100</Tag>
            {institution.is_repeat_offender && <Tag tone="bad">Repeat offender</Tag>}
          </span>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
        }
        actions={
          <Link
            to={`/cases?search=${encodeURIComponent(institution.canonical_name)}`}
<<<<<<< HEAD
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition-colors"
          >
            Filter all cases for this institution
            <ChevronRight className="w-3.5 h-3.5" />
=======
            className="text-[13px] text-brand hover:underline"
          >
            Filter all cases for this institution
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          </Link>
        }
      />

<<<<<<< HEAD
      {/* Main Dossier Card */}
      <Card>
        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <dl className="space-y-2.5">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">AICTE Permanent ID</dt>
              <dd className="font-mono font-bold text-slate-900 mt-0.5">
                {institution.aicte_permanent_id || 'NOT_ASSIGNED'}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Internal Reference ID</dt>
              <dd className="font-mono text-slate-700 mt-0.5">{institution.institution_id}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Jurisdiction Location</dt>
              <dd className="font-medium text-slate-900 mt-0.5">
                {institution.district ? `${institution.district}, ` : ''}
                {institution.state}
              </dd>
            </div>
            {institution.contact_email && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Official Email</dt>
                <dd className="font-mono text-slate-700 mt-0.5">{institution.contact_email}</dd>
              </div>
            )}
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Registered In Portal</dt>
              <dd className="text-slate-700 mt-0.5">{new Date(institution.created_at).toLocaleDateString()}</dd>
            </div>
          </dl>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Statutory Risk Factors
            </div>
            {institution.risk_factors && institution.risk_factors.length > 0 ? (
              <ul className="space-y-1.5">
                {institution.risk_factors.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">No active risk factors recorded.</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Participating Bureaus & Cells
              </div>
              <div className="flex flex-wrap gap-1.5">
                {institution.participating_bureaus?.map((b) => {
                  const cleanB = b.replace('BUR-', '');
                  const color = BUREAU_COLORS[cleanB] || 'bg-slate-100 text-slate-700 border-slate-200';
                  return (
                    <span key={b} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${color}`}>
                      {cleanB}
                    </span>
                  );
                })}
=======
      <Card>
        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[13px]">
          <dl className="space-y-2">
            <div><dt className="text-[12px] text-muted">AICTE permanent ID</dt><dd className="font-medium">{institution.aicte_permanent_id || 'NOT_ASSIGNED'}</dd></div>
            <div><dt className="text-[12px] text-muted">Internal ID</dt><dd className="font-medium">{institution.institution_id}</dd></div>
            <div><dt className="text-[12px] text-muted">Location</dt><dd>{institution.district ? `${institution.district}, ` : ''}{institution.state}</dd></div>
            {institution.contact_email && <div><dt className="text-[12px] text-muted">Email</dt><dd>{institution.contact_email}</dd></div>}
            {institution.contact_phone && <div><dt className="text-[12px] text-muted">Phone</dt><dd>{institution.contact_phone}</dd></div>}
            <div><dt className="text-[12px] text-muted">Registered in system</dt><dd>{new Date(institution.created_at).toLocaleDateString()}</dd></div>
          </dl>

          <div>
            <div className="text-[12px] text-muted mb-1">Risk factors</div>
            {institution.risk_factors && institution.risk_factors.length > 0 ? (
              <ul className="list-disc pl-5 space-y-0.5">
                {institution.risk_factors.map((f) => <li key={f}>{f}</li>)}
              </ul>
            ) : (
              <p className="text-muted">No risk factors recorded.</p>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-[12px] text-muted mb-1">Participating bureaus and cells</div>
              <div className="flex flex-wrap gap-1.5">
                {institution.participating_bureaus?.map((b) => <Tag key={b}>{b.replace('BUR-', '')}</Tag>)}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              </div>
            </div>
            {aliases && aliases.length > 0 && (
              <div>
<<<<<<< HEAD
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Recognized Institutional Aliases
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {aliases.map((al: any) => (
                    <span key={al.alias_id} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {al.alias_name}
                    </span>
                  ))}
=======
                <div className="text-[12px] text-muted mb-1">Known aliases</div>
                <div className="flex flex-wrap gap-1.5">
                  {aliases.map((al: any) => <Tag key={al.alias_id}>{al.alias_name}</Tag>)}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

<<<<<<< HEAD
      {/* Active Overlap Alert Callout */}
      {overlap_alerts && overlap_alerts.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-300/80 bg-amber-50/80 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Active Inter-Bureau Overlap Flagged ({overlap_alerts[0].alert_id})
                </h3>
                <Tag tone="warn">{overlap_alerts[0].status}</Tag>
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">{overlap_alerts[0].explanation}</p>
              <p className="text-xs text-slate-900 mt-2">
                <strong className="font-semibold text-amber-900">Recommended Coordination:</strong>{' '}
                {overlap_alerts[0].recommended_action}
              </p>
            </div>
          </div>
          <Link
            to="/overlaps"
            className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/50 shadow-2xs transition-colors"
          >
            Open overlap hub
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Cases"
          value={cases.filter((c) => c.status !== 'DISPOSED' && c.status !== 'CLOSED').length}
          icon={<Layers className="w-4 h-4 text-blue-600" />}
        />
        <StatCard
          label="Overdue SLA"
          value={cases.filter((c) => c.is_overdue).length}
          tone="bad"
          icon={<AlertOctagon className="w-4 h-4 text-rose-600" />}
        />
        <StatCard
          label="Bureaus Involved"
          value={institution.participating_bureaus?.length ?? 0}
          icon={<Building2 className="w-4 h-4 text-purple-600" />}
        />
        <StatCard
          label="Risk Assessment"
          value={`${institution.risk_score ?? 0} / 100`}
          tone={institution.risk_level === 'HIGH' ? 'bad' : institution.risk_level === 'MEDIUM' ? 'warn' : 'default'}
          icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Dossier */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Institution Case Dossier"
            description="Complete register of complaints filed regarding this institution"
            actions={
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {cases.length} total records
              </span>
            }
          />
          <div className="divide-y divide-slate-100">
            {cases.map((c) => (
              <div
                key={c.case_id}
                className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/cases/${c.case_id}`}
                      className="font-semibold font-mono text-blue-600 hover:underline"
                    >
                      {c.complaint_reference}
                    </Link>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {c.current_bureau_id.replace('BUR-', '')}
                    </span>
                    <Tag tone={priorityTone(c.priority)}>{c.priority}</Tag>
                    <Tag tone={statusTone(c.status)}>{c.status.replace(/_/g, ' ')}</Tag>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{c.description}</p>
                  <div className="text-[11px] text-slate-500">
                    Category: <strong className="text-slate-700">{c.category}</strong> · Received:{' '}
                    <span className="font-mono">{new Date(c.received_at).toLocaleDateString()}</span> ·{' '}
                    <span className={c.is_overdue ? 'text-rose-600 font-bold' : ''}>
=======
      {overlap_alerts && overlap_alerts.length > 0 && (
        <div className="p-4 rounded-md border border-warn/30 bg-warn/5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-semibold">
                Active potential overlapping cases flagged ({overlap_alerts[0].alert_id})
              </h3>
              <Tag tone="warn">{overlap_alerts[0].status}</Tag>
            </div>
            <p className="text-[13px] text-muted mt-1">{overlap_alerts[0].explanation}</p>
            <p className="text-[13px] mt-2">
              <span className="font-medium">Recommended coordination:</span> {overlap_alerts[0].recommended_action}
            </p>
          </div>
          <Link to="/overlaps" className="shrink-0 text-[13px] text-brand hover:underline">Open overlap hub</Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active cases"
          value={cases.filter(c => c.status !== 'DISPOSED' && c.status !== 'CLOSED').length}
        />
        <StatCard
          label="Overdue"
          value={cases.filter(c => c.is_overdue).length}
          tone="bad"
        />
        <StatCard
          label="Bureaus involved"
          value={institution.participating_bureaus?.length ?? 0}
        />
        <StatCard
          label="Risk score"
          value={`${institution.risk_score ?? 0} / 100`}
          tone={institution.risk_level === 'HIGH' ? 'bad' : institution.risk_level === 'MEDIUM' ? 'warn' : 'default'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Institution case dossier"
            actions={<span className="text-[12px] text-muted">{cases.length} total records</span>}
          />
          <div className="divide-y divide-line">
            {cases.map((c) => (
              <div key={c.case_id} className="p-4 flex items-start justify-between gap-4 hover:bg-page">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/cases/${c.case_id}`} className="font-medium text-[13px] text-brand hover:underline">
                      {c.complaint_reference}
                    </Link>
                    <Tag>{c.current_bureau_id.replace('BUR-', '')}</Tag>
                    <Tag tone={priorityTone(c.priority)}>{c.priority}</Tag>
                    <Tag tone={statusTone(c.status)}>{c.status}</Tag>
                  </div>
                  <p className="text-[13px] leading-relaxed">{c.description}</p>
                  <div className="text-[12px] text-muted">
                    Category: {c.category} · Received: {new Date(c.received_at).toLocaleDateString()} ·{' '}
                    <span className={c.is_overdue ? 'text-bad font-medium' : ''}>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                      {c.is_overdue ? 'Overdue deadline' : `SLA: ${c.days_pending}d pending`}
                    </span>
                  </div>
                </div>
<<<<<<< HEAD
                <Link
                  to={`/cases/${c.case_id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-white text-slate-700 transition-colors shadow-2xs shrink-0"
                >
                  Open
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
=======
                <Link to={`/cases/${c.case_id}`} className="text-[13px] text-brand hover:underline shrink-0">Open</Link>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              </div>
            ))}
          </div>
        </Card>

<<<<<<< HEAD
        {/* Unified Institutional Timeline */}
        <Card className="flex flex-col">
          <CardHeader
            title="Unified Institutional Timeline"
            description="Chronological event log across all bureaus"
            actions={<span className="text-xs text-slate-400">Most recent first</span>}
          />
          <ul className="divide-y divide-slate-100 overflow-y-auto max-h-[600px] flex-1">
            {timeline.slice(0, 15).map((act, idx) => (
              <li key={idx} className="p-4 text-xs space-y-1 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{new Date(act.created_at).toLocaleDateString()}</span>
                  <span>Case: {act.case_id}</span>
                </div>
                <div className="font-bold text-slate-900">{act.action_type.replace(/_/g, ' ')}</div>
                <p className="text-slate-600 leading-relaxed bg-white p-2 rounded-lg border border-slate-100 text-xs">
                  {act.remarks}
                </p>
                {act.next_action && (
                  <div className="text-[11px] text-slate-500 font-medium">Next: {act.next_action}</div>
                )}
=======
        <Card>
          <CardHeader title="Unified institutional timeline" actions={<span className="text-[12px] text-muted">Most recent first</span>} />
          <ul className="divide-y divide-line">
            {timeline.slice(0, 15).map((act, idx) => (
              <li key={idx} className="flex gap-3 p-4 text-[13px]">
                <div className="w-20 shrink-0 text-[12px] text-muted">{new Date(act.created_at).toLocaleDateString()}</div>
                <div className="min-w-0">
                  <div className="font-medium">{act.action_type}</div>
                  <div className="text-[12px] text-muted">Case: {act.case_id}</div>
                  <p className="mt-1 leading-snug">{act.remarks}</p>
                  {act.next_action && <div className="mt-1 text-[12px] text-muted">Next: {act.next_action}</div>}
                </div>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
<<<<<<< HEAD

export default Institution360;
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

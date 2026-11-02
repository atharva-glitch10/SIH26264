import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { api } from '../services/api';
import { Institution, Case, CaseAction, OverlapAlert } from '../types';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Tag from '../components/ui/Tag';
import EmptyState from '../components/ui/EmptyState';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { priorityTone, riskTone, statusTone } from '../components/ui/styles';

const BUREAU_COLORS: Record<string, string> = {
  RB: 'bg-blue-50 text-blue-700 border-blue-200/80',
  PGRC: 'bg-purple-50 text-purple-700 border-purple-200/80',
  APP: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  APPROVAL: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  VIG: 'bg-rose-50 text-rose-700 border-rose-200/80',
  VIGILANCE: 'bg-rose-50 text-rose-700 border-rose-200/80',
};

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium">Loading institution profile and grievance history…</span>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Institution not found"
        action={
          <Link to="/institutions" className="text-xs font-semibold text-blue-600 hover:underline">
            Return to directory
          </Link>
        }
      />
    );
  }

  const { institution, aliases, cases, overlap_alerts, timeline } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={institution.canonical_name}
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
        }
        actions={
          <Link
            to={`/cases?search=${encodeURIComponent(institution.canonical_name)}`}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition-colors"
          >
            Filter all cases for this institution
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

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
              </div>
            </div>
            {aliases && aliases.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Recognized Institutional Aliases
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {aliases.map((al: any) => (
                    <span key={al.alias_id} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {al.alias_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

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
                      {c.is_overdue ? 'Overdue deadline' : `SLA: ${c.days_pending}d pending`}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/cases/${c.case_id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-white text-slate-700 transition-colors shadow-2xs shrink-0"
                >
                  Open
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </div>
            ))}
          </div>
        </Card>

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
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Institution360;

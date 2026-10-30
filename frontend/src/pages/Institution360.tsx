import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Institution, Case, CaseAction, OverlapAlert } from '../types';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Tag from '../components/ui/Tag';
import EmptyState from '../components/ui/EmptyState';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { priorityTone, riskTone, statusTone } from '../components/ui/styles';

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
    return <div className="flex items-center justify-center min-h-[50vh] text-sm text-muted">Loading institution profile and case history…</div>;
  }

  if (!data) {
    return (
      <EmptyState
        title="Institution not found"
        action={<Link to="/institutions" className="text-sm hover:underline">Return to directory</Link>}
      />
    );
  }

  const { institution, aliases, cases, overlap_alerts, timeline } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={institution.canonical_name}
        breadcrumb={<Link to="/institutions" className="hover:underline">Institutions</Link>}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>{institution.institution_type} · {institution.region} Region</span>
            <Tag tone={riskTone(institution.risk_level)}>Risk {institution.risk_score ?? 0} / 100</Tag>
            {institution.is_repeat_offender && <Tag tone="danger">Repeat offender</Tag>}
          </span>
        }
        actions={
          <Link
            to={`/cases?search=${encodeURIComponent(institution.canonical_name)}`}
            className="text-sm hover:underline"
          >
            Filter all cases for this institution
          </Link>
        }
      />

      <Card>
        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <dl className="space-y-2">
            <div><dt className="text-xs text-muted">AICTE permanent ID</dt><dd className="font-medium">{institution.aicte_permanent_id || 'NOT_ASSIGNED'}</dd></div>
            <div><dt className="text-xs text-muted">Internal ID</dt><dd className="font-medium">{institution.institution_id}</dd></div>
            <div><dt className="text-xs text-muted">Location</dt><dd>{institution.district ? `${institution.district}, ` : ''}{institution.state}</dd></div>
            {institution.contact_email && <div><dt className="text-xs text-muted">Email</dt><dd>{institution.contact_email}</dd></div>}
            {institution.contact_phone && <div><dt className="text-xs text-muted">Phone</dt><dd>{institution.contact_phone}</dd></div>}
            <div><dt className="text-xs text-muted">Registered in system</dt><dd>{new Date(institution.created_at).toLocaleDateString()}</dd></div>
          </dl>

          <div>
            <div className="text-xs text-muted mb-1">Why this score</div>
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
              <div className="text-xs text-muted mb-1">Participating bureaus and cells</div>
              <div className="flex flex-wrap gap-1.5">
                {institution.participating_bureaus?.map((b) => <Tag key={b}>{b.replace('BUR-', '')}</Tag>)}
              </div>
            </div>
            {aliases && aliases.length > 0 && (
              <div>
                <div className="text-xs text-muted mb-1">Known aliases</div>
                <div className="flex flex-wrap gap-1.5">
                  {aliases.map((al: any) => <Tag key={al.alias_id}>{al.alias_name}</Tag>)}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {overlap_alerts && overlap_alerts.length > 0 && (
        <div className="p-4 rounded-md border border-warning/40 bg-warning/5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">
                Active potential overlapping cases flagged ({overlap_alerts[0].alert_id})
              </h3>
              <Tag tone="warning">{overlap_alerts[0].status}</Tag>
            </div>
            <p className="text-sm text-muted mt-1">{overlap_alerts[0].explanation}</p>
            <p className="text-sm mt-2">
              <span className="font-medium">Recommended coordination:</span> {overlap_alerts[0].recommended_action}
            </p>
          </div>
          <Link to="/overlaps" className="shrink-0 text-sm hover:underline">Open overlap hub</Link>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total grievances" value={cases.length} />
        <StatCard label="Under process" value={cases.filter(c => c.status === 'UNDER_PROCESS').length} />
        <StatCard label="Pending scrutiny" value={cases.filter(c => c.status === 'PENDING' || c.status === 'RECEIVED').length} />
        <StatCard label="Disposed cases" value={cases.filter(c => c.status === 'DISPOSED' || c.status === 'CLOSED').length} />
        <StatCard label="Escalations" value={cases.filter(c => c.status === 'ESCALATED').length} />
        <StatCard label="Overdue SLA" value={cases.filter(c => c.is_overdue).length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Institution case dossier"
            actions={<span className="text-xs text-muted">{cases.length} total records</span>}
          />
          <div className="divide-y divide-border">
            {cases.map((c) => (
              <div key={c.case_id} className="p-4 flex items-start justify-between gap-4 hover:bg-page">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/cases/${c.case_id}`} className="font-medium text-sm">
                      {c.complaint_reference}
                    </Link>
                    <Tag>{c.current_bureau_id.replace('BUR-', '')}</Tag>
                    <Tag tone={priorityTone(c.priority)}>{c.priority}</Tag>
                    <Tag tone={statusTone(c.status)}>{c.status}</Tag>
                  </div>
                  <p className="text-sm leading-relaxed">{c.description}</p>
                  <div className="text-xs text-muted">
                    Category: {c.category} · Received: {new Date(c.received_at).toLocaleDateString()} ·{' '}
                    <span className={c.is_overdue ? 'text-danger font-medium' : ''}>
                      {c.is_overdue ? 'Overdue deadline' : `SLA: ${c.days_pending}d pending`}
                    </span>
                  </div>
                </div>
                <Link to={`/cases/${c.case_id}`} className="text-sm hover:underline shrink-0">Open</Link>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Unified institutional timeline" actions={<span className="text-xs text-muted">Most recent first</span>} />
          <ul className="divide-y divide-border">
            {timeline.slice(0, 15).map((act, idx) => (
              <li key={idx} className="flex gap-3 p-4 text-sm">
                <div className="w-20 shrink-0 text-xs text-muted">{new Date(act.created_at).toLocaleDateString()}</div>
                <div className="min-w-0">
                  <div className="font-medium">{act.action_type}</div>
                  <div className="text-xs text-muted">Case: {act.case_id}</div>
                  <p className="mt-1 leading-snug">{act.remarks}</p>
                  {act.next_action && <div className="mt-1 text-xs text-muted">Next: {act.next_action}</div>}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

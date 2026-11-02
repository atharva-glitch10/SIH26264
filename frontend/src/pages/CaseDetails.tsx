import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
<<<<<<< HEAD
import {
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldAlert,
  GitBranch,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  ExternalLink,
} from 'lucide-react';
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
import { api } from '../services/api';
import { CaseDetail, CaseAction } from '../types';
import { SmartCasePanel } from '../components/case/SmartCasePanel';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { priorityTone, slaTone, statusTone } from '../components/ui/styles';

<<<<<<< HEAD
const inputClass =
  'w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 shadow-xs cursor-pointer';
const textareaClass =
  'w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 shadow-xs min-h-[90px]';
const labelClass = 'block text-xs font-semibold text-slate-700 mb-1.5';
=======
const inputClass = 'w-full h-9 px-3 text-[13px] bg-white border border-line rounded-sm text-ink placeholder:text-muted';
const textareaClass = 'w-full px-3 py-2 text-[13px] bg-white border border-line rounded-sm text-ink placeholder:text-muted';
const labelClass = 'block text-[12px] font-medium text-ink mb-1';
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

export const CaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentRole, refreshSummary } = useOutletContext<{ currentRole: string; refreshSummary: () => void }>();
  const { canActOnBureau } = useAuth();
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);

  // Modals state
  const [modalType, setModalType] = useState<'ASSIGN' | 'TRANSFER' | 'ESCALATE' | 'DISPOSE' | 'ACTION' | null>(null);
  const [assignee, setAssignee] = useState('USR-RB-01');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [transferBureau, setTransferBureau] = useState('BUR-PGRC');
  const [transferReason, setTransferReason] = useState('');
  const [escalateReason, setEscalateReason] = useState('');
  const [disposalSummary, setDisposalSummary] = useState('');
  const [disposalType, setDisposalType] = useState('SATISFACTORY_COMPLIANCE');
  const [newRemark, setNewRemark] = useState('');
  const [nextActionNote, setNextActionNote] = useState('');

  useEffect(() => {
    if (id) {
      loadCase(id);
    }
  }, [id]);

  const loadCase = async (caseId: string) => {
    setLoading(true);
    try {
      const res = await api.getCaseDetail(caseId);
      setCaseData(res);
    } catch (e) {
      console.error('Failed to load case detail', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await api.assignCase(id, {
        assigned_user_id: assignee,
        remarks: assignRemarks || 'Assigned for active handling',
<<<<<<< HEAD
        actor_user_id: currentRole,
=======
        actor_user_id: currentRole
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      });
      setModalType(null);
      loadCase(id);
      refreshSummary();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Assignment failed');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !transferReason.trim()) {
      alert('Transfer reason is mandatory');
      return;
    }
    try {
      await api.transferCase(id, {
        destination_bureau_id: transferBureau,
        reason: transferReason,
<<<<<<< HEAD
        actor_user_id: currentRole,
=======
        actor_user_id: currentRole
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      });
      setModalType(null);
      loadCase(id);
      refreshSummary();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Transfer failed');
    }
  };

  const handleEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !escalateReason.trim()) {
      alert('Escalation reason is mandatory');
      return;
    }
    try {
      await api.escalateCase(id, {
        reason: escalateReason,
<<<<<<< HEAD
        actor_user_id: currentRole,
=======
        actor_user_id: currentRole
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      });
      setModalType(null);
      loadCase(id);
      refreshSummary();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Escalation failed');
    }
  };

  const handleDispose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !disposalSummary.trim()) {
      alert('Disposal summary is mandatory');
      return;
    }
    try {
      await api.disposeCase(id, {
        disposal_summary: disposalSummary,
        resolution_type: disposalType,
<<<<<<< HEAD
        actor_user_id: currentRole,
=======
        actor_user_id: currentRole
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      });
      setModalType(null);
      loadCase(id);
      refreshSummary();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Disposal failed');
    }
  };

  if (loading) {
<<<<<<< HEAD
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium">Loading case file and action history…</span>
      </div>
    );
=======
    return <div className="flex items-center justify-center min-h-[50vh] text-[13px] text-muted">Loading case file and action history…</div>;
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
  }

  if (!caseData) {
    return (
      <EmptyState
        title="Case record not found"
<<<<<<< HEAD
        action={
          <Link to="/cases" className="text-xs font-semibold text-blue-600 hover:underline">
            Return to case register
          </Link>
        }
=======
        action={<Link to="/cases" className="text-[13px] text-brand hover:underline">Return to case register</Link>}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      />
    );
  }

  const close = () => setModalType(null);
  const canAct = canActOnBureau(caseData.current_bureau_id);
<<<<<<< HEAD
  const modalCancel = (
    <Button variant="secondary" onClick={close}>
      Cancel
    </Button>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title={caseData.complaint_reference}
        breadcrumb={
          <Link to="/cases" className="hover:text-blue-600 flex items-center gap-1 font-medium transition-colors">
            ← Case Register
          </Link>
        }
        description={
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Tag tone={statusTone(caseData.status)}>{caseData.status.replace(/_/g, ' ')}</Tag>
            <Tag tone={priorityTone(caseData.priority)}>{caseData.priority} priority</Tag>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
              {caseData.case_id}
            </span>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {!canAct && (
              <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5">
                View only · Handled by {caseData.current_bureau_id.replace('BUR-', '')}
=======
  const modalCancel = <Button variant="ghost" onClick={close}>Cancel</Button>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={caseData.complaint_reference}
        breadcrumb={<Link to="/cases" className="hover:underline">Case register</Link>}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Tag tone={statusTone(caseData.status)}>{caseData.status}</Tag>
            <Tag tone={priorityTone(caseData.priority)}>{caseData.priority} priority</Tag>
            <span className="font-mono text-[12px]">{caseData.case_id}</span>
          </span>
        }
        actions={
          <>
            {!canAct && (
              <span className="text-[12px] text-muted border border-line rounded-sm px-2.5 py-1.5">
                View only · handled by {caseData.current_bureau_id.replace('BUR-', '')}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              </span>
            )}
            {canAct && caseData.status === 'DISPOSED' && (
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    await api.closeCase(caseData.case_id);
                    loadCase(caseData.case_id);
                    refreshSummary();
                  } catch (err: any) {
                    alert(err.response?.data?.detail || 'Closure failed');
                  }
                }}
<<<<<<< HEAD
                className="bg-white"
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              >
                Formally close case
              </Button>
            )}
            {canAct && caseData.status !== 'DISPOSED' && caseData.status !== 'CLOSED' && (
              <>
<<<<<<< HEAD
                <Button variant="secondary" onClick={() => setModalType('ASSIGN')} className="bg-white">
                  Reassign officer
                </Button>
                <Button variant="secondary" onClick={() => setModalType('TRANSFER')} className="bg-white">
                  Transfer bureau
                </Button>
                <Button variant="secondary" onClick={() => setModalType('ESCALATE')} className="bg-white">
                  Escalate case
                </Button>
                <Button onClick={() => setModalType('DISPOSE')} className="bg-slate-900 text-white">
                  Record disposal
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Primary Case Summary Card */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                to={`/institutions/${caseData.institution_id}`}
                className="text-lg font-bold font-heading text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <Building2 className="w-5 h-5 text-blue-600" />
                {caseData.institution_name}
              </Link>
              <div className="text-xs text-slate-500 mt-0.5 font-mono">
                Permanent ID: {caseData.institution_id}
              </div>
            </div>
            <Tag tone={slaTone(caseData.sla_status)}>
              {caseData.sla_status === 'APPROACHING_DEADLINE'
                ? 'Approaching SLA deadline (< 7 days)'
                : caseData.sla_status.replace(/_/g, ' ')}
            </Tag>
          </div>

          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2 border-t border-slate-100">
            <div>
              <dt className="text-slate-500 font-medium">Category</dt>
              <dd className="font-semibold text-slate-900 mt-0.5">{caseData.category}</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium">Date Received</dt>
              <dd className="font-semibold text-slate-900 mt-0.5 font-mono">
                {new Date(caseData.received_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium">Handling Bureau</dt>
              <dd className="font-semibold text-slate-900 mt-0.5">{caseData.current_bureau_name}</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium">Assigned Officer</dt>
              <dd className="font-semibold text-slate-900 mt-0.5">{caseData.assigned_user_name || 'Unassigned'}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs bg-slate-50/70 p-3 rounded-lg">
            <div className="text-slate-700">
              <strong className="font-semibold text-slate-900">SLA Resolution Target:</strong>{' '}
              <span className="font-mono">{new Date(caseData.expected_disposal_at).toLocaleDateString()}</span>
              {' '}(<span className="font-bold text-slate-900">{caseData.days_pending}</span> days elapsed since filing).
              {caseData.actual_disposal_at && (
                <span className="text-emerald-700 font-medium ml-1">
                  Resolved on: <strong className="font-mono">{new Date(caseData.actual_disposal_at).toLocaleDateString()}</strong>.
                </span>
              )}
            </div>
=======
                <Button variant="secondary" onClick={() => setModalType('ASSIGN')}>Reassign officer</Button>
                <Button variant="secondary" onClick={() => setModalType('TRANSFER')}>Transfer bureau</Button>
                <Button variant="secondary" onClick={() => setModalType('ESCALATE')}>Escalate case</Button>
                <Button onClick={() => setModalType('DISPOSE')}>Record disposal</Button>
              </>
            )}
          </>
        }
      />

      <Card>
        <CardBody className="space-y-3">
          <div className="text-[13px]">
            <Link to={`/institutions/${caseData.institution_id}`} className="text-base font-semibold text-brand hover:underline">
              {caseData.institution_name}
            </Link>
            <span className="ml-2 text-[12px] text-muted">({caseData.institution_id})</span>
          </div>
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-[13px]">
            <div><dt className="text-[12px] text-muted">Category</dt><dd className="font-medium">{caseData.category}</dd></div>
            <div><dt className="text-[12px] text-muted">Received</dt><dd className="font-medium">{new Date(caseData.received_at).toLocaleDateString()}</dd></div>
            <div><dt className="text-[12px] text-muted">Handling bureau</dt><dd className="font-medium">{caseData.current_bureau_name}</dd></div>
            <div><dt className="text-[12px] text-muted">Assigned officer</dt><dd className="font-medium">{caseData.assigned_user_name}</dd></div>
          </dl>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[13px]">
            <div>
              <span className="font-medium">SLA resolution target:</span> {new Date(caseData.expected_disposal_at).toLocaleDateString()}
              {' '}({caseData.days_pending} days elapsed since filing).
              {caseData.actual_disposal_at && (
                <span> Resolved on: <strong>{new Date(caseData.actual_disposal_at).toLocaleDateString()}</strong>.</span>
              )}
            </div>
            <Tag tone={slaTone(caseData.sla_status)}>
              {caseData.sla_status === 'APPROACHING_DEADLINE' ? 'Approaching deadline (< 7 days)' : caseData.sla_status}
            </Tag>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          </div>
        </CardBody>
      </Card>

<<<<<<< HEAD
      {/* Smart Intake Panel (Institution Matching, Duplicates, AI Classification) */}
=======
      {/* Smart intake: institution link, category, duplicate check */}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      <SmartCasePanel
        caseData={caseData}
        canAct={canAct}
        onChanged={() => {
          loadCase(caseData.case_id);
          refreshSummary();
        }}
      />

<<<<<<< HEAD
      {/* Dossier Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Allegation & Action Details */}
          <Card>
            <CardHeader
              title="Complaint Allegation & Operational Overview"
              description="Detailed statement of grievance and latest procedural directions"
            />
            <CardBody className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs leading-relaxed text-slate-800 font-mono">
                {caseData.description}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Last Recorded Action
                  </span>
                  <span className="font-semibold text-slate-900 block mt-1">
                    {caseData.last_action_summary || 'None recorded'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                    {new Date(caseData.last_action_at).toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Next Required Action
                  </span>
                  <span className="font-semibold text-slate-900 block mt-1">
                    {caseData.next_action || 'Pending officer review'}
                  </span>
=======
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Complaint allegation and overview" />
            <CardBody className="space-y-4">
              <p className="text-[13px] leading-relaxed bg-page p-3 rounded-sm border border-line">
                {caseData.description}
              </p>
              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <span className="text-[12px] text-muted block">Last recorded action</span>
                  <span className="font-medium block mt-0.5">{caseData.last_action_summary || 'None recorded'}</span>
                  <span className="text-[12px] text-muted">{new Date(caseData.last_action_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[12px] text-muted block">Next required action</span>
                  <span className="font-medium block mt-0.5">{caseData.next_action || 'Pending officer review'}</span>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                </div>
              </div>
            </CardBody>
          </Card>

<<<<<<< HEAD
          {/* Related & Cross-Bureau Linked Cases */}
          <Card>
            <CardHeader
              title="Related & Cross-Bureau Linked Cases"
              description="Procedural connections established across AICTE divisions"
              actions={
                caseData.active_overlap_alert_id && (
                  <Link
                    to="/overlaps"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                  >
                    View overlap alert {caseData.active_overlap_alert_id}
                    <ArrowRight className="w-3.5 h-3.5" />
=======
          <Card>
            <CardHeader
              title="Related and cross-bureau linked cases"
              actions={
                caseData.active_overlap_alert_id && (
                  <Link to="/overlaps" className="text-[13px] text-brand hover:underline">
                    View overlap alert {caseData.active_overlap_alert_id}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                  </Link>
                )
              }
            />
            {caseData.related_cases && caseData.related_cases.length > 0 ? (
<<<<<<< HEAD
              <div className="divide-y divide-slate-100">
=======
              <div className="divide-y divide-line">
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                {caseData.related_cases.map((rel) => {
                  const target = rel.related_case;
                  return (
                    <div key={rel.relationship_id} className="p-4 flex items-start justify-between gap-4">
<<<<<<< HEAD
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/cases/${target?.case_id}`}
                            className="font-semibold font-mono text-blue-600 hover:underline"
                          >
                            {target?.complaint_reference || rel.related_case_id}
                          </Link>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {target?.current_bureau_id.replace('BUR-', '')}
                          </span>
                          <Tag tone="info">{rel.relationship_type}</Tag>
                        </div>
                        <p className="text-slate-700 line-clamp-2">{target?.description}</p>
                        <div className="text-[11px] text-slate-400">
                          Linkage rationale: <span className="text-slate-600">{rel.reason}</span>
                        </div>
                      </div>
                      <Link
                        to={`/cases/${target?.case_id}`}
                        className="text-xs font-semibold text-blue-600 hover:underline shrink-0 flex items-center gap-1"
                      >
                        Open case
                        <ExternalLink className="w-3 h-3" />
=======
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link to={`/cases/${target?.case_id}`} className="font-medium text-[13px] text-brand hover:underline">
                            {target?.complaint_reference || rel.related_case_id}
                          </Link>
                          <Tag>{target?.current_bureau_id.replace('BUR-', '')}</Tag>
                          <Tag tone="info">{rel.relationship_type}</Tag>
                        </div>
                        <p className="text-[13px]">{target?.description}</p>
                        <div className="text-[12px] text-muted">Linkage reason: {rel.reason}</div>
                      </div>
                      <Link to={`/cases/${target?.case_id}`} className="text-[13px] text-brand hover:underline shrink-0">
                        Open case
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
<<<<<<< HEAD
              <div className="p-8 text-center text-xs text-slate-500">
                No formal case linkages recorded yet for this complaint.
              </div>
=======
              <EmptyState title="No formal case linkages recorded yet for this complaint." />
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            )}
          </Card>
        </div>

<<<<<<< HEAD
        {/* Action History / Audit Trail */}
        <Card className="flex flex-col">
          <CardHeader
            title="Action History & Audit Trail"
            actions={
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {caseData.actions?.length || 0} events
              </span>
            }
          />
          <ul className="divide-y divide-slate-100 overflow-y-auto max-h-[600px] flex-1">
            {caseData.actions?.map((act) => (
              <li key={act.action_id} className="p-4 text-xs space-y-1.5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{new Date(act.created_at).toLocaleDateString()}</span>
                  <span>
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">{act.action_type.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                    {act.actor_user_id}
                  </span>
                </div>
                {act.previous_status && act.previous_status !== act.new_status && (
                  <div className="text-[11px] text-blue-700 font-medium">
                    Status: {act.previous_status} → {act.new_status}
                  </div>
                )}
                <p className="text-slate-600 leading-relaxed bg-white p-2 rounded-lg border border-slate-100 text-xs">
                  {act.remarks}
                </p>
                {act.next_action && (
                  <div className="text-[11px] text-slate-500 font-medium pt-1">
                    Next direction: {act.next_action}
                  </div>
                )}
=======
        <Card>
          <CardHeader title="Action history and audit trail" actions={<span className="text-[12px] text-muted">{caseData.actions?.length || 0} events</span>} />
          <ul className="divide-y divide-line">
            {caseData.actions?.map((act) => (
              <li key={act.action_id} className="flex gap-3 p-4 text-[13px]">
                <div className="w-32 shrink-0 text-[12px] text-muted">
                  <div>{new Date(act.created_at).toLocaleDateString()}</div>
                  <div>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="font-medium">{act.action_type}</div>
                  <div className="text-[12px] text-muted">
                    Actor: {act.actor_user_id}
                    {act.previous_status && act.previous_status !== act.new_status && (
                      <span className="ml-2 text-ink">{act.previous_status} → {act.new_status}</span>
                    )}
                  </div>
                  <p className="leading-relaxed">{act.remarks}</p>
                  {act.next_action && <div className="text-[12px] text-muted">Next step: {act.next_action}</div>}
                </div>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              </li>
            ))}
          </ul>
        </Card>
      </div>

<<<<<<< HEAD
      {/* Reassign Modal */}
      <Modal
        open={modalType === 'ASSIGN'}
        onClose={close}
        title="Assign Investigating Officer"
        footer={
          <div className="flex justify-end gap-2">
            {modalCancel}
            <Button type="submit" form="form-assign">
              Confirm Assignment
            </Button>
          </div>
        }
      >
        <form id="form-assign" onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className={labelClass}>Select Bureau Officer</label>
=======
      <Modal
        open={modalType === 'ASSIGN'}
        onClose={close}
        title="Assign investigating officer"
        footer={<>{modalCancel}<Button type="submit" form="form-assign">Confirm assignment</Button></>}
      >
        <form id="form-assign" onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className={labelClass}>Select bureau officer</label>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={inputClass}>
              <option value="USR-RB-01">Shri Rajesh Verma (Regulation Bureau)</option>
              <option value="USR-RB-02">Ms. Sangeeta Rao (Regulation Bureau)</option>
              <option value="USR-PGRC-01">Dr. Meenakshi Sundaram (PGRC)</option>
              <option value="USR-PGRC-02">Shri Amit Trivedi (PGRC)</option>
              <option value="USR-APP-01">Dr. Sanjay Deshmukh (Approvals)</option>
              <option value="USR-VIG-01">Shri V. K. Iyer (Vigilance)</option>
            </select>
          </div>
          <div>
<<<<<<< HEAD
            <label className={labelClass}>Assignment Directive & Remarks</label>
            <textarea
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              className={textareaClass}
              placeholder="Provide specific inspection directions or hearing focus areas..."
=======
            <label className={labelClass}>Assignment remarks</label>
            <textarea
              rows={3}
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              placeholder="Directives for preliminary scrutiny or notice issuance..."
              className={textareaClass}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            />
          </div>
        </form>
      </Modal>

<<<<<<< HEAD
      {/* Transfer Bureau Modal */}
      <Modal
        open={modalType === 'TRANSFER'}
        onClose={close}
        title="Transfer Case to Another AICTE Bureau"
        footer={
          <div className="flex justify-end gap-2">
            {modalCancel}
            <Button type="submit" form="form-transfer">
              Execute Transfer
            </Button>
          </div>
        }
      >
        <form id="form-transfer" onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className={labelClass}>Destination Bureau / Cell</label>
            <select
              value={transferBureau}
              onChange={(e) => setTransferBureau(e.target.value)}
              className={inputClass}
            >
              <option value="BUR-RB">Regulation Bureau (RB) - AICTE Norms & Standards</option>
              <option value="BUR-PGRC">Public Grievance Redressal Cell (PGRC) - Student/Faculty Disputes</option>
              <option value="BUR-APP">Approval Bureau - Affiliation & Extension of Approval</option>
              <option value="BUR-VIG">Vigilance Cell - Integrity & Financial Audits</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Jurisdiction Reassignment Reason (Mandatory)</label>
            <textarea
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              className={textareaClass}
              placeholder="State statutory basis for transfer per AICTE Allocation of Business Rules..."
              required
=======
      <Modal
        open={modalType === 'TRANSFER'}
        onClose={close}
        title="Inter-bureau case transfer"
        footer={<>{modalCancel}<Button type="submit" form="form-transfer">Execute transfer</Button></>}
      >
        <form id="form-transfer" onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className={labelClass}>Destination bureau *</label>
            <select value={transferBureau} onChange={(e) => setTransferBureau(e.target.value)} className={inputClass}>
              <option value="BUR-RB">Regulation Bureau (RB) - Affiliations, norms, approvals</option>
              <option value="BUR-PGRC">Public Grievance Redressal Cell (PGRC) - Student/Faculty</option>
              <option value="BUR-APP">Approval Bureau - Intake capacity variations</option>
              <option value="BUR-VIG">Vigilance Cell - Capitation fee & ethics inquiries</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Transfer rationale / justification *</label>
            <textarea
              required
              rows={3}
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="Explain why jurisdiction belongs to receiving Bureau..."
              className={textareaClass}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            />
          </div>
        </form>
      </Modal>

<<<<<<< HEAD
      {/* Escalate Modal */}
      <Modal
        open={modalType === 'ESCALATE'}
        onClose={close}
        title="Escalate Matter to Senior Management"
        footer={
          <div className="flex justify-end gap-2">
            {modalCancel}
            <Button type="submit" form="form-escalate" variant="danger">
              Confirm Escalation
            </Button>
          </div>
        }
      >
        <form id="form-escalate" onSubmit={handleEscalate} className="space-y-4">
          <p className="text-xs text-rose-600 font-medium">
            Escalation flags this case for immediate review by AICTE Vice Chairman / Chairman office.
          </p>
          <div>
            <label className={labelClass}>Escalation Justification (Mandatory)</label>
            <textarea
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              className={textareaClass}
              placeholder="Detail SLA breach, non-cooperation from institution, or severe public impact..."
              required
            />
          </div>
        </form>
      </Modal>

      {/* Dispose Case Modal */}
      <Modal
        open={modalType === 'DISPOSE'}
        onClose={close}
        title="Record Formal Case Disposal Findings"
        footer={
          <div className="flex justify-end gap-2">
            {modalCancel}
            <Button type="submit" form="form-dispose">
              Record Disposal & Findings
            </Button>
          </div>
        }
      >
        <form id="form-dispose" onSubmit={handleDispose} className="space-y-4">
          <div>
            <label className={labelClass}>Resolution Type</label>
            <select
              value={disposalType}
              onChange={(e) => setDisposalType(e.target.value)}
              className={inputClass}
            >
              <option value="SATISFACTORY_COMPLIANCE">Satisfactory Compliance Verified</option>
              <option value="GRIEVANCE_REDRESSED">Grievance Redressed via Bureau Hearing</option>
              <option value="WARNING_LETTER_ISSUED">Official Show-Cause Warning Issued</option>
              <option value="PENALTY_IMPOSED">Statutory Penalty / Intake Reduced</option>
              <option value="DISMISSED_UNFOUNDED">Dismissed after Evidentiary Review</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Disposal Summary Findings (Mandatory)</label>
            <textarea
              value={disposalSummary}
              onChange={(e) => setDisposalSummary(e.target.value)}
              className={textareaClass}
              placeholder="Detail inspection report findings, committee recommendations, and closure orders..."
              required
=======
      <Modal
        open={modalType === 'ESCALATE'}
        onClose={close}
        title="Escalate case to senior management"
        footer={<>{modalCancel}<Button type="submit" variant="danger" form="form-escalate">Confirm escalation</Button></>}
      >
        <form id="form-escalate" onSubmit={handleEscalate} className="space-y-4">
          <div>
            <label className={labelClass}>Escalation justification *</label>
            <textarea
              required
              rows={3}
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="Specify statutory violation severity, non-responsiveness, or executive directive needed..."
              className={textareaClass}
            />
          </div>
          <p className="text-[12px] text-muted">
            Escalation will set Priority to URGENT and notify Senior Management & Member Secretary office.
          </p>
        </form>
      </Modal>

      <Modal
        open={modalType === 'DISPOSE'}
        onClose={close}
        title="Record formal case disposal"
        footer={<>{modalCancel}<Button type="submit" form="form-dispose">Mark as disposed</Button></>}
      >
        <form id="form-dispose" onSubmit={handleDispose} className="space-y-4">
          <div>
            <label className={labelClass}>Resolution category</label>
            <select value={disposalType} onChange={(e) => setDisposalType(e.target.value)} className={inputClass}>
              <option value="SATISFACTORY_COMPLIANCE">Satisfactory Institutional Compliance Verified</option>
              <option value="GRIEVANCE_REDRESSED">Grievance Fully Redressed by College</option>
              <option value="PENALTY_ENFORCED">Regulatory Penalty / Show-Cause Concluded</option>
              <option value="MUTUALLY_RESOLVED">Mutually Resolved with Stakeholders</option>
              <option value="REJECTED_UNFOUNDED">Found Unsubstantiated Upon Scrutiny</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Disposal findings and resolution summary *</label>
            <textarea
              required
              rows={4}
              value={disposalSummary}
              onChange={(e) => setDisposalSummary(e.target.value)}
              placeholder="Record formal disposal findings, committee directives, and closure timestamps..."
              className={textareaClass}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
<<<<<<< HEAD

export default CaseDetails;
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

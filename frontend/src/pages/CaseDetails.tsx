import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
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
import { inputClass, labelClass, priorityTone, slaTone, statusTone } from '../components/ui/styles';

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
        actor_user_id: currentRole
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
        actor_user_id: currentRole
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
        actor_user_id: currentRole
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
        actor_user_id: currentRole
      });
      setModalType(null);
      loadCase(id);
      refreshSummary();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Disposal failed');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh] text-sm text-muted">Loading case file and action history…</div>;
  }

  if (!caseData) {
    return (
      <EmptyState
        title="Case record not found"
        action={<Link to="/cases" className="text-sm hover:underline">Return to case register</Link>}
      />
    );
  }

  const close = () => setModalType(null);
  const canAct = canActOnBureau(caseData.current_bureau_id);
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
            <span className="font-mono text-xs">{caseData.case_id}</span>
          </span>
        }
        actions={
          <>
            {!canAct && (
              <span className="text-xs text-muted border border-border rounded-sm px-2.5 py-1.5">
                View only · handled by {caseData.current_bureau_id.replace('BUR-', '')}
              </span>
            )}
            {canAct && caseData.status === 'DISPOSED' && (
              <Button
                onClick={async () => {
                  try {
                    await api.closeCase(caseData.case_id);
                    loadCase(caseData.case_id);
                    refreshSummary();
                  } catch (err: any) {
                    alert(err.response?.data?.detail || 'Closure failed');
                  }
                }}
              >
                Formally close case
              </Button>
            )}
            {canAct && caseData.status !== 'DISPOSED' && caseData.status !== 'CLOSED' && (
              <>
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
          <div className="text-sm">
            <Link to={`/institutions/${caseData.institution_id}`} className="text-base font-semibold">
              {caseData.institution_name}
            </Link>
            <span className="ml-2 text-xs text-muted">({caseData.institution_id})</span>
          </div>
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div><dt className="text-xs text-muted">Category</dt><dd className="font-medium">{caseData.category}</dd></div>
            <div><dt className="text-xs text-muted">Received</dt><dd className="font-medium">{new Date(caseData.received_at).toLocaleDateString()}</dd></div>
            <div><dt className="text-xs text-muted">Handling bureau</dt><dd className="font-medium">{caseData.current_bureau_name}</dd></div>
            <div><dt className="text-xs text-muted">Assigned officer</dt><dd className="font-medium">{caseData.assigned_user_name}</dd></div>
          </dl>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm">
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
          </div>
        </CardBody>
      </Card>

      {/* Smart intake: institution link, category, duplicate check */}
      <SmartCasePanel
        caseData={caseData}
        canAct={canAct}
        onChanged={() => {
          loadCase(caseData.case_id);
          refreshSummary();
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Complaint allegation and overview" />
            <CardBody className="space-y-4">
              <p className="text-sm leading-relaxed bg-page p-3 rounded-sm border border-border">
                {caseData.description}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted block">Last recorded action</span>
                  <span className="font-medium block mt-0.5">{caseData.last_action_summary || 'None recorded'}</span>
                  <span className="text-xs text-muted">{new Date(caseData.last_action_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-muted block">Next required action</span>
                  <span className="font-medium block mt-0.5">{caseData.next_action || 'Pending officer review'}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Related and cross-bureau linked cases"
              actions={
                caseData.active_overlap_alert_id && (
                  <Link to="/overlaps" className="text-sm hover:underline">
                    View overlap alert {caseData.active_overlap_alert_id}
                  </Link>
                )
              }
            />
            {caseData.related_cases && caseData.related_cases.length > 0 ? (
              <div className="divide-y divide-border">
                {caseData.related_cases.map((rel) => {
                  const target = rel.related_case;
                  return (
                    <div key={rel.relationship_id} className="p-4 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link to={`/cases/${target?.case_id}`} className="font-medium text-sm">
                            {target?.complaint_reference || rel.related_case_id}
                          </Link>
                          <Tag>{target?.current_bureau_id.replace('BUR-', '')}</Tag>
                          <Tag tone="info">{rel.relationship_type}</Tag>
                        </div>
                        <p className="text-sm">{target?.description}</p>
                        <div className="text-xs text-muted">Linkage reason: {rel.reason}</div>
                      </div>
                      <Link to={`/cases/${target?.case_id}`} className="text-sm hover:underline shrink-0">
                        Open case
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="No formal case linkages recorded yet for this complaint." />
            )}
          </Card>
        </div>

        <Card>
          <CardHeader title="Action history and audit trail" actions={<span className="text-xs text-muted">{caseData.actions?.length || 0} events</span>} />
          <ul className="divide-y divide-border">
            {caseData.actions?.map((act) => (
              <li key={act.action_id} className="flex gap-3 p-4 text-sm">
                <div className="w-20 shrink-0 text-xs text-muted">
                  <div>{new Date(act.created_at).toLocaleDateString()}</div>
                  <div>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="font-medium">{act.action_type}</div>
                  <div className="text-xs text-muted">
                    Actor: {act.actor_user_id}
                    {act.previous_status && act.previous_status !== act.new_status && (
                      <span className="ml-2 text-ink">{act.previous_status} → {act.new_status}</span>
                    )}
                  </div>
                  <p className="leading-relaxed">{act.remarks}</p>
                  {act.next_action && <div className="text-xs text-muted">Next step: {act.next_action}</div>}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Modal
        open={modalType === 'ASSIGN'}
        onClose={close}
        title="Assign investigating officer"
        footer={<>{modalCancel}<Button type="submit" form="form-assign">Confirm assignment</Button></>}
      >
        <form id="form-assign" onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className={labelClass}>Select bureau officer</label>
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
            <label className={labelClass}>Assignment remarks</label>
            <textarea
              rows={3}
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              placeholder="Directives for preliminary scrutiny or notice issuance..."
              className={inputClass}
            />
          </div>
        </form>
      </Modal>

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
              className={inputClass}
            />
          </div>
        </form>
      </Modal>

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
              className={inputClass}
            />
          </div>
          <p className="text-xs text-muted">
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
              className={inputClass}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

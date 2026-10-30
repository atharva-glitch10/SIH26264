import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { OverlapAlert } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Tag, { TagTone } from '../components/ui/Tag';
import Modal from '../components/ui/Modal';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { inputClass, labelClass, priorityTone, selectClass, statusTone, toggleClass } from '../components/ui/styles';

const severityTone = (s?: string): TagTone => (s === 'CRITICAL' ? 'danger' : s === 'HIGH' ? 'warning' : 'neutral');
const alertStatusTone = (s?: string): TagTone => (s === 'RESOLVED' ? 'success' : s === 'DISMISSED' ? 'neutral' : 'warning');

export const OverlapAlerts: React.FC = () => {
  const { currentRole, refreshSummary } = useOutletContext<{ currentRole: string; refreshSummary: () => void }>();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<OverlapAlert[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [selectedAlertDetail, setSelectedAlertDetail] = useState<OverlapAlert | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modals
  const [modalAction, setModalAction] = useState<'LINK' | 'RESOLVE' | 'DISMISS' | null>(null);
  const [sourceCaseId, setSourceCaseId] = useState('');
  const [targetCaseId, setTargetCaseId] = useState('');
  const [linkReason, setLinkReason] = useState('Concurrent regulatory and grievance proceedings regarding same institution');
  const [leadBureau, setLeadBureau] = useState('BUR-RB');
  const [resolutionReason, setResolutionReason] = useState('Inter-bureau coordination meeting held. Joint inquiry and synchronized inspection timeline agreed.');
  const [dismissJustification, setDismissJustification] = useState('');

  useEffect(() => {
    loadAlerts();
  }, [statusFilter, severityFilter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getOverlaps({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        severity: severityFilter !== 'ALL' ? severityFilter : undefined
      });
      setAlerts(data);
      if (data.length > 0 && !selectedAlertId) {
        openAlertDetail(data[0].alert_id);
      }
    } catch (e) {
      console.error('Failed to load overlap alerts', e);
    } finally {
      setLoading(false);
    }
  };

  const openAlertDetail = async (alertId: string) => {
    setSelectedAlertId(alertId);
    setDetailLoading(true);
    try {
      const detail = await api.getOverlapDetail(alertId);
      setSelectedAlertDetail(detail);
      if (detail.cases && detail.cases.length >= 2) {
        setSourceCaseId(detail.cases[0].case_id);
        setTargetCaseId(detail.cases[1].case_id);
      }
    } catch (e) {
      console.error('Failed to load alert detail', e);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleScan = async () => {
    try {
      const res = await api.triggerOverlapScan();
      alert(res.message);
      loadAlerts();
      refreshSummary();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReview = async () => {
    if (!selectedAlertId) return;
    try {
      await api.reviewOverlap(selectedAlertId, { reviewer_id: currentRole });
      loadAlerts();
      openAlertDetail(selectedAlertId);
      refreshSummary();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLinkCases = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertId || !sourceCaseId || !targetCaseId) return;
    try {
      await api.linkCases(selectedAlertId, {
        source_case_id: sourceCaseId,
        target_case_id: targetCaseId,
        reason: linkReason,
        lead_bureau_id: leadBureau,
        actor_user_id: currentRole
      });
      setModalAction(null);
      loadAlerts();
      openAlertDetail(selectedAlertId);
      refreshSummary();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to link cases');
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertId || !resolutionReason.trim()) {
      alert('Resolution explanation is mandatory');
      return;
    }
    try {
      await api.resolveOverlap(selectedAlertId, {
        resolution_reason: resolutionReason,
        lead_bureau_id: leadBureau,
        actor_user_id: currentRole
      });
      setModalAction(null);
      loadAlerts();
      openAlertDetail(selectedAlertId);
      refreshSummary();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to resolve overlap');
    }
  };

  const handleDismiss = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertId || !dismissJustification.trim()) {
      alert('Mandatory justification is required to dismiss a cross-bureau overlap alert');
      return;
    }
    try {
      await api.dismissOverlap(selectedAlertId, {
        justification: dismissJustification,
        actor_user_id: currentRole
      });
      setModalAction(null);
      loadAlerts();
      openAlertDetail(selectedAlertId);
      refreshSummary();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to dismiss overlap');
    }
  };

  const close = () => setModalAction(null);
  const cancelBtn = <Button variant="ghost" onClick={close}>Cancel</Button>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Cross-Bureau Overlap Detection Hub"
        description="Rule-based decision support identifying institutions with concurrent active cases across RB, PGRC and other cells."
        actions={
          <Button variant="secondary" size="sm" onClick={handleScan}>
            <RefreshCw className="w-3.5 h-3.5" />
            Trigger overlap rule scan
          </Button>
        }
      />

      <Card className="p-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted">Lifecycle:</span>
          {['ALL', 'NEW', 'COORDINATION_REQUIRED', 'LINKED_ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              aria-pressed={statusFilter === st}
              className={`${toggleClass(statusFilter === st)} !h-8 !text-xs`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted">Severity:</span>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className={selectClass}>
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-4 overflow-hidden flex flex-col max-h-[800px]">
          <CardHeader title={`Flagged institutions (${alerts.length})`} />
          <div className="overflow-y-auto divide-y divide-border flex-1">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted">No overlap alerts found.</div>
            ) : (
              alerts.map((alt) => {
                const isSelected = alt.alert_id === selectedAlertId;
                return (
                  <div
                    key={alt.alert_id}
                    onClick={() => openAlertDetail(alt.alert_id)}
                    className={`py-3 pr-4 pl-[13px] cursor-pointer border-l-[3px] ${
                      isSelected ? 'border-brand bg-brand-soft' : 'border-transparent hover:bg-page'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">{alt.alert_id}</span>
                      <Tag tone={severityTone(alt.severity)}>{alt.severity}</Tag>
                    </div>
                    <h4 className="font-medium text-sm mt-1 leading-snug line-clamp-2">{alt.institution_name}</h4>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted">
                      <span>{alt.cases_count} cases · {alt.participating_bureaus.join(', ')}</span>
                      <Tag>{alt.status}</Tag>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <div className="lg:col-span-8 space-y-6">
          {detailLoading ? (
            <Card className="p-12 text-center text-muted text-sm">Loading side-by-side case inspection...</Card>
          ) : selectedAlertDetail ? (
            <div className="space-y-6">
              <Card>
                <CardBody className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Tag>{selectedAlertDetail.alert_id}</Tag>
                        <Tag tone={alertStatusTone(selectedAlertDetail.status)}>{selectedAlertDetail.status}</Tag>
                        <Tag>{selectedAlertDetail.participating_bureaus.join(' & ')} concurrent</Tag>
                      </div>
                      <h2 className="text-lg font-semibold">{selectedAlertDetail.institution_name}</h2>
                      <p className="text-xs text-muted">
                        Institution ID: {selectedAlertDetail.institution_id} · Permanent ID: {selectedAlertDetail.aicte_permanent_id || 'PENDING'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {selectedAlertDetail.status !== 'RESOLVED' && selectedAlertDetail.status !== 'DISMISSED' && (
                        <>
                          <Button variant="secondary" size="sm" onClick={handleReview}>Mark under review</Button>
                          <Button variant="secondary" size="sm" onClick={() => setModalAction('LINK')}>Link related cases</Button>
                          <Button variant="secondary" size="sm" onClick={() => setModalAction('DISMISS')}>Dismiss</Button>
                          <Button size="sm" onClick={() => setModalAction('RESOLVE')}>Resolve alert</Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-sm border border-warning/30 bg-warning/5 space-y-2 text-sm">
                    <div className="font-medium">Detection finding</div>
                    <p className="leading-relaxed">{selectedAlertDetail.explanation}</p>
                    <div className="pt-2 border-t border-warning/30">
                      <span className="font-medium">Recommended inter-bureau step:</span> {selectedAlertDetail.recommended_action}
                    </div>
                  </div>

                  {selectedAlertDetail.resolution_reason && (
                    <div className="bg-page p-3 rounded-sm border border-border text-sm space-y-1">
                      <span className="font-medium">Recorded resolution / justification</span>
                      <p className="text-muted">{selectedAlertDetail.resolution_reason}</p>
                    </div>
                  )}
                </CardBody>
              </Card>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Side-by-side inter-bureau case comparison</h3>
                  <span className="text-xs text-muted">Comparing {selectedAlertDetail.cases?.length || 0} active matters</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAlertDetail.cases?.map((c, idx) => (
                    <Card key={c.case_id}>
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <span className="text-sm font-medium">Case {idx + 1}: {c.complaint_reference}</span>
                        <Tag>{c.bureau_code}</Tag>
                      </div>
                      <CardBody className="space-y-3 text-sm">
                        <dl className="space-y-1.5">
                          <div className="flex justify-between gap-3"><dt className="text-muted">Status</dt><dd><Tag tone={statusTone(c.status)}>{c.status}</Tag></dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-muted">Priority</dt><dd><Tag tone={priorityTone(c.priority)}>{c.priority}</Tag></dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-muted">Category</dt><dd className="text-right">{c.category}</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-muted">Assigned officer</dt><dd>{c.assigned_user_name || 'Unassigned'}</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-muted">Date of receipt</dt><dd>{new Date(c.received_at).toLocaleDateString()}</dd></div>
                        </dl>
                        <div className="pt-2 border-t border-border space-y-2">
                          <div>
                            <span className="text-xs text-muted block">Last action</span>
                            <p className="mt-0.5 leading-snug">{c.last_action_summary || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted block">Next required action</span>
                            <p className="mt-0.5 leading-snug">{c.next_action || 'Pending'}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-border text-right">
                          <Link to={`/cases/${c.case_id}`} className="hover:underline">View full case file</Link>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center text-muted text-sm">
              Select an overlap alert from the left panel to inspect participating cases.
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={modalAction === 'LINK'}
        onClose={close}
        title="Formally link overlapping cases"
        footer={<>{cancelBtn}<Button type="submit" form="form-link">Confirm linkage</Button></>}
      >
        <form id="form-link" onSubmit={handleLinkCases} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Source case ID</label>
              <input type="text" required value={sourceCaseId} onChange={(e) => setSourceCaseId(e.target.value)} className={`${inputClass} font-mono`} />
            </div>
            <div>
              <label className={labelClass}>Target case ID</label>
              <input type="text" required value={targetCaseId} onChange={(e) => setTargetCaseId(e.target.value)} className={`${inputClass} font-mono`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Designate lead coordination bureau</label>
            <select value={leadBureau} onChange={(e) => setLeadBureau(e.target.value)} className={inputClass}>
              <option value="BUR-RB">Regulation Bureau (RB) - Leads statutory compliance</option>
              <option value="BUR-PGRC">Public Grievance Redressal Cell (PGRC) - Leads student redressal</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Linkage justification / coordination plan *</label>
            <textarea required rows={3} value={linkReason} onChange={(e) => setLinkReason(e.target.value)} className={inputClass} />
          </div>
        </form>
      </Modal>

      <Modal
        open={modalAction === 'RESOLVE'}
        onClose={close}
        title="Resolve cross-bureau overlap alert"
        footer={<>{cancelBtn}<Button type="submit" form="form-resolve">Confirm resolution</Button></>}
      >
        <form id="form-resolve" onSubmit={handleResolve} className="space-y-4">
          <div>
            <label className={labelClass}>Assigned lead bureau</label>
            <select value={leadBureau} onChange={(e) => setLeadBureau(e.target.value)} className={inputClass}>
              <option value="BUR-RB">Regulation Bureau (RB)</option>
              <option value="BUR-PGRC">Public Grievance Redressal Cell (PGRC)</option>
              <option value="BUR-APP">Approval Bureau</option>
              <option value="BUR-VIG">Vigilance Cell</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Resolution explanation *</label>
            <textarea required rows={4} value={resolutionReason} onChange={(e) => setResolutionReason(e.target.value)} className={inputClass} />
          </div>
        </form>
      </Modal>

      <Modal
        open={modalAction === 'DISMISS'}
        onClose={close}
        title="Dismiss overlap alert (mandatory justification)"
        footer={<>{cancelBtn}<Button type="submit" variant="danger" form="form-dismiss">Dismiss alert</Button></>}
      >
        <form id="form-dismiss" onSubmit={handleDismiss} className="space-y-4">
          <div>
            <label className={labelClass}>Mandatory justification for dismissal *</label>
            <textarea
              required
              rows={4}
              value={dismissJustification}
              onChange={(e) => setDismissJustification(e.target.value)}
              placeholder="Explain why these complaints represent distinct non-overlapping matters not requiring joint inter-bureau proceedings..."
              className={inputClass}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

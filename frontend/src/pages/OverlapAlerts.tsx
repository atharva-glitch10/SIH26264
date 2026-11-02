import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
<<<<<<< HEAD
import {
  RefreshCw,
  GitMerge,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
=======
import { RefreshCw } from 'lucide-react';
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
import { api } from '../services/api';
import { OverlapAlert } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Tag, { TagTone } from '../components/ui/Tag';
import Modal from '../components/ui/Modal';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { priorityTone, statusTone } from '../components/ui/styles';

<<<<<<< HEAD
const inputClass =
  'w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 shadow-xs';
const areaClass =
  'w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 shadow-xs min-h-[80px]';
const labelClass = 'block text-xs font-semibold text-slate-700 mb-1.5';
const selectClass =
  'h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 shadow-xs cursor-pointer';
=======
const inputClass = 'w-full h-9 px-3 text-[13px] bg-white border border-line rounded-sm text-ink placeholder:text-muted';
const areaClass = 'w-full px-3 py-2 text-[13px] bg-white border border-line rounded-sm text-ink placeholder:text-muted';
const labelClass = 'block text-[12px] font-medium text-ink mb-1';
const selectClass = 'h-9 px-2.5 text-[13px] bg-white border border-line rounded-sm text-ink';
const toggleClass = (active: boolean) =>
  `h-8 px-2.5 text-[12px] font-medium rounded-sm border ${
    active ? 'bg-brand text-white border-brand' : 'bg-white text-ink border-line hover:bg-page'
  }`;
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

const severityTone = (s?: string): TagTone => (s === 'CRITICAL' ? 'bad' : s === 'HIGH' ? 'warn' : 'neutral');
const alertStatusTone = (s?: string): TagTone => (s === 'RESOLVED' ? 'ok' : s === 'DISMISSED' ? 'neutral' : 'warn');

export const OverlapAlerts: React.FC = () => {
  const { currentRole, refreshSummary } = useOutletContext<{ currentRole: string; refreshSummary: () => void }>();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<OverlapAlert[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [selectedAlertDetail, setSelectedAlertDetail] = useState<OverlapAlert | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
<<<<<<< HEAD
  const [scanning, setScanning] = useState(false);
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

  // Modals
  const [modalAction, setModalAction] = useState<'LINK' | 'RESOLVE' | 'DISMISS' | null>(null);
  const [sourceCaseId, setSourceCaseId] = useState('');
  const [targetCaseId, setTargetCaseId] = useState('');
<<<<<<< HEAD
  const [linkReason, setLinkReason] = useState(
    'Concurrent regulatory and grievance proceedings regarding same institution'
  );
  const [leadBureau, setLeadBureau] = useState('BUR-RB');
  const [resolutionReason, setResolutionReason] = useState(
    'Inter-bureau coordination meeting held. Joint inquiry and synchronized inspection timeline agreed.'
  );
=======
  const [linkReason, setLinkReason] = useState('Concurrent regulatory and grievance proceedings regarding same institution');
  const [leadBureau, setLeadBureau] = useState('BUR-RB');
  const [resolutionReason, setResolutionReason] = useState('Inter-bureau coordination meeting held. Joint inquiry and synchronized inspection timeline agreed.');
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
  const [dismissJustification, setDismissJustification] = useState('');

  useEffect(() => {
    loadAlerts();
  }, [statusFilter, severityFilter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getOverlaps({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
<<<<<<< HEAD
        severity: severityFilter !== 'ALL' ? severityFilter : undefined,
=======
        severity: severityFilter !== 'ALL' ? severityFilter : undefined
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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
<<<<<<< HEAD
    setScanning(true);
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
    try {
      const res = await api.triggerOverlapScan();
      alert(res.message);
      loadAlerts();
      refreshSummary();
    } catch (e) {
      console.error(e);
<<<<<<< HEAD
    } finally {
      setScanning(false);
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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
<<<<<<< HEAD
        actor_user_id: currentRole,
=======
        actor_user_id: currentRole
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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
<<<<<<< HEAD
        actor_user_id: currentRole,
=======
        actor_user_id: currentRole
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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
<<<<<<< HEAD
        actor_user_id: currentRole,
=======
        actor_user_id: currentRole
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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
<<<<<<< HEAD
  const cancelBtn = (
    <Button variant="secondary" onClick={close}>
      Cancel
    </Button>
  );
=======
  const cancelBtn = <Button variant="ghost" onClick={close}>Cancel</Button>;
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Cross-Bureau Overlap Detection Hub"
<<<<<<< HEAD
        description="Rule-based decision support identifying institutions with concurrent active cases across Regulation Bureau (RB), PGRC, and other cells."
        actions={
          <Button variant="secondary" size="sm" onClick={handleScan} disabled={scanning} className="bg-white">
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
=======
        description="Rule-based decision support identifying institutions with concurrent active cases across RB, PGRC and other cells."
        actions={
          <Button variant="secondary" size="sm" onClick={handleScan}>
            <RefreshCw className="w-3.5 h-3.5" />
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            Trigger overlap rule scan
          </Button>
        }
      />

<<<<<<< HEAD
      {/* Filter Toolbar */}
      <Card className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-semibold mr-1">Lifecycle:</span>
=======
      <Card className="p-3 flex flex-wrap items-center justify-between gap-3 text-[13px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted">Lifecycle:</span>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          {['ALL', 'NEW', 'COORDINATION_REQUIRED', 'LINKED_ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              aria-pressed={statusFilter === st}
<<<<<<< HEAD
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {st.replace(/_/g, ' ')}
=======
              className={toggleClass(statusFilter === st)}
            >
              {st}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
<<<<<<< HEAD
          <span className="text-slate-400 font-semibold">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className={selectClass}
          >
=======
          <span className="text-muted">Severity:</span>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className={selectClass}>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </Card>

<<<<<<< HEAD
      {/* Master - Detail Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Master List */}
        <Card className="lg:col-span-4 overflow-hidden flex flex-col max-h-[820px]">
          <CardHeader
            title={`Flagged Institutions (${alerts.length})`}
            description="Active concurrent investigations"
          />
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading alerts…</div>
            ) : alerts.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">No overlap alerts found.</div>
=======
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-4 overflow-hidden flex flex-col max-h-[800px]">
          <CardHeader title={`Flagged institutions (${alerts.length})`} />
          <div className="overflow-y-auto divide-y divide-line flex-1">
            {loading ? (
              <div className="p-8 text-center text-[13px] text-muted">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-muted">No overlap alerts found.</div>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            ) : (
              alerts.map((alt) => {
                const isSelected = alt.alert_id === selectedAlertId;
                return (
                  <div
                    key={alt.alert_id}
                    onClick={() => openAlertDetail(alt.alert_id)}
<<<<<<< HEAD
                    className={`p-3.5 cursor-pointer transition-all border-l-4 ${
                      isSelected
                        ? 'border-l-blue-600 bg-blue-50/50'
                        : 'border-l-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">{alt.alert_id}</span>
                      <Tag tone={severityTone(alt.severity)}>{alt.severity}</Tag>
                    </div>
                    <h4 className="font-semibold text-[13px] text-slate-900 mt-1 leading-snug line-clamp-2">
                      {alt.institution_name}
                    </h4>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        {alt.cases_count} cases · {alt.participating_bureaus.join(', ')}
                      </span>
                      <Tag tone={alertStatusTone(alt.status)}>{alt.status.replace(/_/g, ' ')}</Tag>
=======
                    className={`py-3 pr-4 pl-[13px] cursor-pointer border-l-[3px] ${
                      isSelected ? 'border-brand bg-brand-soft' : 'border-transparent hover:bg-page'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-muted">{alt.alert_id}</span>
                      <Tag tone={severityTone(alt.severity)}>{alt.severity}</Tag>
                    </div>
                    <h4 className="font-medium text-[13px] mt-1 leading-snug line-clamp-2">{alt.institution_name}</h4>
                    <div className="mt-2 flex items-center justify-between text-[12px] text-muted">
                      <span>{alt.cases_count} cases · {alt.participating_bureaus.join(', ')}</span>
                      <Tag>{alt.status}</Tag>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

<<<<<<< HEAD
        {/* Right Detail Pane */}
        <div className="lg:col-span-8 space-y-6">
          {detailLoading ? (
            <Card className="p-16 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading side-by-side case inspection…
            </Card>
          ) : selectedAlertDetail ? (
            <div className="space-y-6">
              {/* Institution Overlap Header Card */}
=======
        <div className="lg:col-span-8 space-y-6">
          {detailLoading ? (
            <Card className="p-12 text-center text-muted text-[13px]">Loading side-by-side case inspection...</Card>
          ) : selectedAlertDetail ? (
            <div className="space-y-6">
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              <Card>
                <CardBody className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
<<<<<<< HEAD
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          {selectedAlertDetail.alert_id}
                        </span>
                        <Tag tone={alertStatusTone(selectedAlertDetail.status)}>
                          {selectedAlertDetail.status.replace(/_/g, ' ')}
                        </Tag>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {selectedAlertDetail.participating_bureaus.join(' & ')} concurrent
                        </span>
                      </div>
                      <h2 className="text-xl font-bold font-heading text-slate-900">
                        {selectedAlertDetail.institution_name}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Institution ID:{' '}
                        <span className="font-mono text-slate-700 font-semibold">{selectedAlertDetail.institution_id}</span>{' '}
                        · Permanent ID:{' '}
                        <span className="font-mono text-slate-700 font-semibold">
                          {selectedAlertDetail.aicte_permanent_id || 'PENDING'}
                        </span>
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {selectedAlertDetail.status !== 'RESOLVED' && selectedAlertDetail.status !== 'DISMISSED' && (
                        <>
                          <Button variant="secondary" size="sm" onClick={handleReview} className="bg-white">
                            Mark under review
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => setModalAction('LINK')} className="bg-white">
                            Link related cases
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => setModalAction('DISMISS')} className="bg-white">
                            Dismiss
                          </Button>
                          <Button size="sm" onClick={() => setModalAction('RESOLVE')} className="bg-slate-900 text-white">
                            Resolve alert
                          </Button>
=======
                        <Tag>{selectedAlertDetail.alert_id}</Tag>
                        <Tag tone={alertStatusTone(selectedAlertDetail.status)}>{selectedAlertDetail.status}</Tag>
                        <Tag>{selectedAlertDetail.participating_bureaus.join(' & ')} concurrent</Tag>
                      </div>
                      <h2 className="text-lg font-semibold">{selectedAlertDetail.institution_name}</h2>
                      <p className="text-[12px] text-muted">
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
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                        </>
                      )}
                    </div>
                  </div>

<<<<<<< HEAD
                  {/* AI Detection Finding Callout */}
                  <div className="p-4 rounded-xl border border-amber-200/90 bg-amber-50/60 space-y-2 text-xs">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Detection finding
                    </div>
                    <p className="text-slate-700 leading-relaxed">{selectedAlertDetail.explanation}</p>
                    <div className="pt-2 border-t border-amber-200/60 text-slate-800">
                      <strong className="font-semibold text-amber-900">Recommended inter-bureau step:</strong>{' '}
                      {selectedAlertDetail.recommended_action}
=======
                  <div className="p-4 rounded-sm border border-warn/30 bg-warn/5 space-y-2 text-[13px]">
                    <div className="font-medium">Detection finding</div>
                    <p className="leading-relaxed">{selectedAlertDetail.explanation}</p>
                    <div className="pt-2 border-t border-warn/30">
                      <span className="font-medium">Recommended inter-bureau step:</span> {selectedAlertDetail.recommended_action}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                    </div>
                  </div>

                  {selectedAlertDetail.resolution_reason && (
<<<<<<< HEAD
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1">
                      <span className="font-semibold text-slate-900">Recorded resolution / justification</span>
                      <p className="text-slate-600 leading-relaxed">{selectedAlertDetail.resolution_reason}</p>
=======
                    <div className="bg-page p-3 rounded-sm border border-line text-[13px] space-y-1">
                      <span className="font-medium">Recorded resolution / justification</span>
                      <p className="text-muted">{selectedAlertDetail.resolution_reason}</p>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                    </div>
                  )}
                </CardBody>
              </Card>

<<<<<<< HEAD
              {/* Side-by-Side Comparison Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold font-heading text-slate-900">
                    Side-by-Side Inter-Bureau Case Comparison
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Comparing {selectedAlertDetail.cases?.length || 0} active matters
                  </span>
=======
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[13px] font-semibold">Side-by-side inter-bureau case comparison</h3>
                  <span className="text-[12px] text-muted">Comparing {selectedAlertDetail.cases?.length || 0} active matters</span>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAlertDetail.cases?.map((c, idx) => (
<<<<<<< HEAD
                    <Card key={c.case_id} className="overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                        <span className="text-xs font-semibold text-slate-900 font-mono">
                          Case {idx + 1}: {c.complaint_reference}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                          {c.bureau_code}
                        </span>
                      </div>
                      <CardBody className="space-y-3 text-xs">
                        <dl className="space-y-2">
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500">Status</dt>
                            <dd>
                              <Tag tone={statusTone(c.status)}>{c.status.replace(/_/g, ' ')}</Tag>
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500">Priority</dt>
                            <dd>
                              <Tag tone={priorityTone(c.priority)}>{c.priority}</Tag>
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500">Category</dt>
                            <dd className="font-medium text-slate-800 text-right">{c.category}</dd>
                          </div>
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500">Assigned officer</dt>
                            <dd className="font-medium text-slate-800">{c.assigned_user_name || 'Unassigned'}</dd>
                          </div>
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500">Date of receipt</dt>
                            <dd className="font-mono text-slate-700">{new Date(c.received_at).toLocaleDateString()}</dd>
                          </div>
                        </dl>

                        <div className="pt-2.5 border-t border-slate-100 space-y-2">
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 block">Last Action</span>
                            <p className="mt-0.5 text-slate-700 leading-snug">{c.last_action_summary || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 block">Next Required Action</span>
                            <p className="mt-0.5 text-slate-700 leading-snug">{c.next_action || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex justify-end">
                          <Link
                            to={`/cases/${c.case_id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            View full case file
                            <ExternalLink className="w-3 h-3" />
                          </Link>
=======
                    <Card key={c.case_id}>
                      <div className="flex items-center justify-between border-b border-line px-4 py-3">
                        <span className="text-[13px] font-medium">Case {idx + 1}: {c.complaint_reference}</span>
                        <Tag>{c.bureau_code}</Tag>
                      </div>
                      <CardBody className="space-y-3 text-[13px]">
                        <dl className="space-y-1.5">
                          <div className="flex justify-between gap-3"><dt className="text-muted">Status</dt><dd><Tag tone={statusTone(c.status)}>{c.status}</Tag></dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-muted">Priority</dt><dd><Tag tone={priorityTone(c.priority)}>{c.priority}</Tag></dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-muted">Category</dt><dd className="text-right">{c.category}</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-muted">Assigned officer</dt><dd>{c.assigned_user_name || 'Unassigned'}</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-muted">Date of receipt</dt><dd>{new Date(c.received_at).toLocaleDateString()}</dd></div>
                        </dl>
                        <div className="pt-2 border-t border-line space-y-2">
                          <div>
                            <span className="text-[12px] text-muted block">Last action</span>
                            <p className="mt-0.5 leading-snug">{c.last_action_summary || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[12px] text-muted block">Next required action</span>
                            <p className="mt-0.5 leading-snug">{c.next_action || 'Pending'}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-line text-right">
                          <Link to={`/cases/${c.case_id}`} className="text-brand hover:underline">View full case file</Link>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
<<<<<<< HEAD
            <Card className="p-16 text-center text-slate-400 text-xs">
              Select an alert from the list to inspect side-by-side case files.
=======
            <Card className="p-12 text-center text-muted text-[13px]">
              Select an overlap alert from the left panel to inspect participating cases.
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            </Card>
          )}
        </div>
      </div>

<<<<<<< HEAD
      {/* Link Cases Modal */}
      <Modal open={modalAction === 'LINK'} title="Link Related Cases" onClose={close}>
        <form onSubmit={handleLinkCases} className="space-y-4">
          <p className="text-xs text-slate-500">
            Establish a formal procedural relationship between overlapping cases so notices and findings are shared.
          </p>
          <div>
            <label className={labelClass}>Source Case ID</label>
            <input
              value={sourceCaseId}
              onChange={(e) => setSourceCaseId(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Target Case ID (Concurrent Matter)</label>
            <input
              value={targetCaseId}
              onChange={(e) => setTargetCaseId(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Lead Bureau for Coordinated Inspection</label>
            <select
              value={leadBureau}
              onChange={(e) => setLeadBureau(e.target.value)}
              className={selectClass}
            >
              <option value="BUR-RB">Regulation Bureau (Lead)</option>
              <option value="BUR-PGRC">Public Grievance Redressal Cell (Lead)</option>
              <option value="BUR-APP">Approval Bureau (Lead)</option>
              <option value="BUR-VIG">Vigilance Cell (Lead)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Linking Reason</label>
            <textarea
              value={linkReason}
              onChange={(e) => setLinkReason(e.target.value)}
              className={areaClass}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            {cancelBtn}
            <Button type="submit">Establish Case Link</Button>
=======
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
            <textarea required rows={3} value={linkReason} onChange={(e) => setLinkReason(e.target.value)} className={areaClass} />
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          </div>
        </form>
      </Modal>

<<<<<<< HEAD
      {/* Resolve Overlap Modal */}
      <Modal open={modalAction === 'RESOLVE'} title="Resolve Overlap Alert" onClose={close}>
        <form onSubmit={handleResolve} className="space-y-4">
          <p className="text-xs text-slate-500">
            Document the inter-bureau coordination outcome (e.g. combined hearing, agreed lead bureau, or unified decision).
          </p>
          <div>
            <label className={labelClass}>Lead Bureau Appointed</label>
            <select
              value={leadBureau}
              onChange={(e) => setLeadBureau(e.target.value)}
              className={selectClass}
            >
              <option value="BUR-RB">Regulation Bureau</option>
              <option value="BUR-PGRC">Public Grievance Redressal Cell</option>
=======
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
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              <option value="BUR-APP">Approval Bureau</option>
              <option value="BUR-VIG">Vigilance Cell</option>
            </select>
          </div>
          <div>
<<<<<<< HEAD
            <label className={labelClass}>Coordination Summary & Action Agreed</label>
            <textarea
              value={resolutionReason}
              onChange={(e) => setResolutionReason(e.target.value)}
              className={areaClass}
              placeholder="e.g. Joint meeting held. Bureau X will issue unified notice..."
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            {cancelBtn}
            <Button type="submit">Confirm Alert Resolution</Button>
=======
            <label className={labelClass}>Resolution explanation *</label>
            <textarea required rows={4} value={resolutionReason} onChange={(e) => setResolutionReason(e.target.value)} className={areaClass} />
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          </div>
        </form>
      </Modal>

<<<<<<< HEAD
      {/* Dismiss Modal */}
      <Modal open={modalAction === 'DISMISS'} title="Dismiss Overlap Alert" onClose={close}>
        <form onSubmit={handleDismiss} className="space-y-4">
          <p className="text-xs text-slate-500">
            Dismissing an overlap requires formal audit justification explaining why the concurrent matters do not conflict.
          </p>
          <div>
            <label className={labelClass}>Justification (Mandatory for Audit Trail)</label>
            <textarea
              value={dismissJustification}
              onChange={(e) => setDismissJustification(e.target.value)}
              className={areaClass}
              placeholder="State why these complaints operate independently with no procedural overlap..."
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            {cancelBtn}
            <Button type="submit" variant="danger">
              Confirm Dismissal
            </Button>
          </div>
=======
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
              className={areaClass}
            />
          </div>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
        </form>
      </Modal>
    </div>
  );
};
<<<<<<< HEAD

export default OverlapAlerts;
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

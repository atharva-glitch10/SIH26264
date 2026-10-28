import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRightLeft,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
  Check,
  X,
  Filter,
  ArrowRight,
  GitMerge
} from 'lucide-react';
import { api } from '../services/api';
import { OverlapAlert } from '../types';

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Cross-Bureau Overlap Detection Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic rule-based decision support identifying institutions with concurrent active cases across RB, PGRC, and other cells.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleScan}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Trigger Overlap Rule Scan
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-semibold uppercase text-[10px]">Filter Lifecycle:</span>
          {['ALL', 'NEW', 'COORDINATION_REQUIRED', 'LINKED_ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold uppercase text-[10px]">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Left List, Right Side-by-Side Comparison Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col (4/12): Overlap Alerts List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[800px]">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Flagged Institutions ({alerts.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Rule-Based Output</span>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No overlap alerts found.</div>
            ) : (
              alerts.map((alt) => {
                const isSelected = alt.alert_id === selectedAlertId;
                return (
                  <div
                    key={alt.alert_id}
                    onClick={() => openAlertDetail(alt.alert_id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50/70 border-l-4 border-amber-500'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500">{alt.alert_id}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          alt.severity === 'CRITICAL'
                            ? 'bg-rose-500 text-white'
                            : alt.severity === 'HIGH'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {alt.severity}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 mt-1 leading-snug line-clamp-2">
                      {alt.institution_name}
                    </h4>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono">{alt.cases_count} cases • {alt.participating_bureaus.join(', ')}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium text-[10px]">
                        {alt.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col (8/12): Overlap Alert Detail & Side-by-Side Comparison */}
        <div className="lg:col-span-8 space-y-6">
          {detailLoading ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              Loading side-by-side case inspection...
            </div>
          ) : selectedAlertDetail ? (
            <div className="space-y-6">
              {/* Alert Header Banner */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono font-bold">
                        {selectedAlertDetail.alert_id}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                          selectedAlertDetail.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedAlertDetail.status === 'DISMISSED'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {selectedAlertDetail.status}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                        {selectedAlertDetail.participating_bureaus.join(' & ')} Concurrent
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {selectedAlertDetail.institution_name}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">
                      Institution ID: {selectedAlertDetail.institution_id} • Permanent ID: {selectedAlertDetail.aicte_permanent_id || 'PENDING'}
                    </p>
                  </div>

                  {/* Actions for Authorized Officers */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {selectedAlertDetail.status !== 'RESOLVED' && selectedAlertDetail.status !== 'DISMISSED' && (
                      <>
                        <button
                          onClick={handleReview}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300"
                        >
                          Mark Under Review
                        </button>
                        <button
                          onClick={() => setModalAction('LINK')}
                          className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 flex items-center gap-1.5"
                        >
                          <GitMerge className="w-3.5 h-3.5" />
                          Link Related Cases
                        </button>
                        <button
                          onClick={() => setModalAction('RESOLVE')}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                        >
                          Resolve Alert
                        </button>
                        <button
                          onClick={() => setModalAction('DISMISS')}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg border border-slate-200"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Explanation Card */}
                <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 space-y-2 text-xs">
                  <div className="font-semibold text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Detection Engine Finding:
                  </div>
                  <p className="text-amber-900 leading-relaxed">{selectedAlertDetail.explanation}</p>
                  <div className="pt-2 border-t border-amber-200 text-amber-800">
                    <strong>Recommended Inter-Bureau Step:</strong> {selectedAlertDetail.recommended_action}
                  </div>
                </div>

                {selectedAlertDetail.resolution_reason && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-slate-900">Recorded Resolution / Justification:</span>
                    <p className="text-slate-600">{selectedAlertDetail.resolution_reason}</p>
                  </div>
                )}
              </div>

              {/* SIDE-BY-SIDE CASE COMPARISON DOSSIER */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-600" />
                    Side-by-Side Inter-Bureau Case Comparison
                  </h3>
                  <span className="text-xs text-slate-500">
                    Comparing {selectedAlertDetail.cases?.length || 0} active matters
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAlertDetail.cases?.map((c, idx) => (
                    <div
                      key={c.case_id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 relative hover:border-teal-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-500" />
                          <span className="text-xs font-bold text-slate-800 font-mono">
                            Case #{idx + 1}: {c.complaint_reference}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-teal-400 font-mono text-[10px] font-bold">
                          {c.bureau_code}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>Status:</span>
                          <span className="font-semibold text-slate-800">{c.status}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Priority:</span>
                          <span className="font-semibold text-slate-800">{c.priority}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Complaint Category:</span>
                          <span className="font-semibold text-slate-800 text-right">{c.category}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Assigned Officer:</span>
                          <span className="font-medium text-slate-800">{c.assigned_user_name || 'Unassigned'}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Date of Receipt:</span>
                          <span className="text-slate-700">{new Date(c.received_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase block">Last Action</span>
                          <p className="text-slate-700 text-[11px] mt-0.5 leading-snug">{c.last_action_summary || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase block">Next Required Action</span>
                          <p className="text-teal-700 text-[11px] font-medium mt-0.5 leading-snug">{c.next_action || 'Pending'}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <Link
                          to={`/cases/${c.case_id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"
                        >
                          View Full Case File
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              Select an overlap alert from the left panel to inspect participating cases.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Link Related Cases */}
      {modalAction === 'LINK' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-purple-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <GitMerge className="w-4 h-4" />
                Formally Link Overlapping Cases
              </h3>
              <button onClick={() => setModalAction(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleLinkCases} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Case ID</label>
                  <input
                    type="text"
                    required
                    value={sourceCaseId}
                    onChange={(e) => setSourceCaseId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Case ID</label>
                  <input
                    type="text"
                    required
                    value={targetCaseId}
                    onChange={(e) => setTargetCaseId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designate Lead Coordination Bureau</label>
                <select
                  value={leadBureau}
                  onChange={(e) => setLeadBureau(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="BUR-RB">Regulation Bureau (RB) - Leads statutory compliance</option>
                  <option value="BUR-PGRC">Public Grievance Redressal Cell (PGRC) - Leads student redressal</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Linkage Justification / Coordination Plan *</label>
                <textarea
                  required
                  rows={3}
                  value={linkReason}
                  onChange={(e) => setLinkReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalAction(null)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg">Confirm Linkage</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Resolve Overlap */}
      {modalAction === 'RESOLVE' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Resolve Cross-Bureau Overlap Alert
              </h3>
              <button onClick={() => setModalAction(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleResolve} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Lead Bureau</label>
                <select
                  value={leadBureau}
                  onChange={(e) => setLeadBureau(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="BUR-RB">Regulation Bureau (RB)</option>
                  <option value="BUR-PGRC">Public Grievance Redressal Cell (PGRC)</option>
                  <option value="BUR-APP">Approval Bureau</option>
                  <option value="BUR-VIG">Vigilance Cell</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution Explanation *</label>
                <textarea
                  required
                  rows={4}
                  value={resolutionReason}
                  onChange={(e) => setResolutionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalAction(null)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Confirm Resolution</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Dismiss Overlap */}
      {modalAction === 'DISMISS' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <X className="w-4 h-4 text-rose-400" />
                Dismiss Overlap Alert (Mandatory Justification)
              </h3>
              <button onClick={() => setModalAction(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleDismiss} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mandatory Justification for Dismissal *</label>
                <textarea
                  required
                  rows={4}
                  value={dismissJustification}
                  onChange={(e) => setDismissJustification(e.target.value)}
                  placeholder="Explain why these complaints represent distinct non-overlapping matters not requiring joint inter-bureau proceedings..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalAction(null)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg">Dismiss Alert</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

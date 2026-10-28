import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import {
  FileText,
  Building2,
  Clock,
  CheckCircle2,
  ArrowRightLeft,
  Flame,
  AlertTriangle,
  History,
  Calendar,
  User,
  ArrowRight,
  ChevronRight,
  Shield,
  Send,
  X,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { CaseDetail, CaseAction } from '../types';

export const CaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentRole, refreshSummary } = useOutletContext<{ currentRole: string; refreshSummary: () => void }>();
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Clock className="w-8 h-8 animate-spin text-teal-600 mb-2" />
        <span className="text-sm font-medium">Loading Case File & Action History...</span>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-8 text-center text-slate-500">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-slate-800">Case Record Not Found</h2>
        <Link to="/cases" className="text-xs text-teal-600 hover:underline mt-2 inline-block">
          Return to cases register
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/cases" className="hover:text-slate-800">Case Register</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-mono font-semibold text-slate-800">{caseData.complaint_reference}</span>
      </div>

      {/* Primary Case Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                {caseData.complaint_reference}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                {caseData.case_id}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                  caseData.status === 'UNDER_PROCESS'
                    ? 'bg-teal-100 text-teal-800 border border-teal-200'
                    : caseData.status === 'ESCALATED'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : caseData.status === 'TRANSFERRED'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : caseData.status === 'DISPOSED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {caseData.status}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                  caseData.priority === 'URGENT'
                    ? 'bg-rose-500 text-white'
                    : caseData.priority === 'HIGH'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {caseData.priority} Priority
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600 shrink-0" />
              <Link
                to={`/institutions/${caseData.institution_id}`}
                className="text-lg sm:text-xl font-bold text-slate-900 hover:text-teal-700 transition-colors"
              >
                {caseData.institution_name}
              </Link>
              <span className="text-xs text-slate-400 font-mono">({caseData.institution_id})</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Category: <strong className="text-slate-700">{caseData.category}</strong></span>
              •
              <span>Received: <strong>{new Date(caseData.received_at).toLocaleDateString()}</strong></span>
              •
              <span>Handling Bureau: <strong className="text-slate-700 font-mono">{caseData.current_bureau_name}</strong></span>
              •
              <span>Assigned Officer: <strong className="text-slate-700">{caseData.assigned_user_name}</strong></span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {caseData.status !== 'DISPOSED' && (
              <>
                <button
                  onClick={() => setModalType('ASSIGN')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
                >
                  Reassign Officer
                </button>
                <button
                  onClick={() => setModalType('TRANSFER')}
                  className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                >
                  Transfer Bureau
                </button>
                <button
                  onClick={() => setModalType('ESCALATE')}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                >
                  Escalate Case
                </button>
                <button
                  onClick={() => setModalType('DISPOSE')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  Record Disposal
                </button>
              </>
            )}
          </div>
        </div>

        {/* SLA Status Indicator Banner */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            caseData.sla_status === 'OVERDUE'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : caseData.sla_status === 'APPROACHING_DEADLINE'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : caseData.sla_status === 'DISPOSED'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-teal-50 border-teal-200 text-teal-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 shrink-0" />
            <div>
              <strong>SLA Resolution Target:</strong> {new Date(caseData.expected_disposal_at).toLocaleDateString()}
              {' '}({caseData.days_pending} days elapsed since filing).
              {caseData.actual_disposal_at && (
                <span> Resolved on: <strong>{new Date(caseData.actual_disposal_at).toLocaleDateString()}</strong>.</span>
              )}
            </div>
          </div>
          <span className="font-bold uppercase tracking-wider text-[11px]">
            {caseData.sla_status === 'APPROACHING_DEADLINE' ? 'Approaching Deadline (< 7 Days)' : caseData.sla_status}
          </span>
        </div>
      </div>

      {/* Description & Action Plan Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description & Case Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Complaint Allegation & Overview</h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              {caseData.description}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Last Recorded Action</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{caseData.last_action_summary || 'None recorded'}</span>
                <span className="text-[10px] text-slate-400">{new Date(caseData.last_action_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Next Required Action</span>
                <span className="font-medium text-teal-700 mt-0.5 block">{caseData.next_action || 'Pending officer review'}</span>
              </div>
            </div>
          </div>

          {/* Related / Overlapping Cases Section */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                Related & Cross-Bureau Linked Cases
              </h3>
              {caseData.active_overlap_alert_id && (
                <Link
                  to={`/overlaps`}
                  className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 hover:bg-amber-100 flex items-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  View Overlap Alert {caseData.active_overlap_alert_id}
                </Link>
              )}
            </div>

            {caseData.related_cases && caseData.related_cases.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {caseData.related_cases.map((rel) => {
                  const target = rel.related_case;
                  return (
                    <div key={rel.relationship_id} className="py-3 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link to={`/cases/${target?.case_id}`} className="font-bold text-teal-700 text-xs font-mono hover:underline">
                            {target?.complaint_reference || rel.related_case_id}
                          </Link>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono">
                            {target?.current_bureau_id.replace('BUR-', '')}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold uppercase">
                            {rel.relationship_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700">{target?.description}</p>
                        <div className="text-[11px] text-slate-500 italic">
                          Linkage Reason: {rel.reason}
                        </div>
                      </div>
                      <Link
                        to={`/cases/${target?.case_id}`}
                        className="px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100"
                      >
                        Open Case
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                No formal case linkages recorded yet for this complaint.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Chronological Action History Timeline */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-teal-600" />
              Action History & Audit Trail
            </h3>
            <span className="text-[11px] text-slate-400">{caseData.actions?.length || 0} Events</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {caseData.actions?.map((act) => (
              <div key={act.action_id} className="relative">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white" />
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{act.action_type}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.created_at).toLocaleDateString()} {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500">
                    Actor: {act.actor_user_id}
                    {act.previous_status && act.previous_status !== act.new_status && (
                      <span className="ml-2 font-sans font-medium text-slate-700">
                        {act.previous_status} → {act.new_status}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-700 text-xs leading-relaxed bg-slate-50/80 p-2.5 rounded border border-slate-100">
                    {act.remarks}
                  </p>

                  {act.next_action && (
                    <div className="text-[11px] text-teal-700 font-medium">
                      Next Step: {act.next_action}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL 1: Assign Officer */}
      {modalType === 'ASSIGN' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Assign Investigating Officer</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAssign} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Bureau Officer</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="USR-RB-01">Shri Rajesh Verma (Regulation Bureau)</option>
                  <option value="USR-RB-02">Ms. Sangeeta Rao (Regulation Bureau)</option>
                  <option value="USR-PGRC-01">Dr. Meenakshi Sundaram (PGRC)</option>
                  <option value="USR-PGRC-02">Shri Amit Trivedi (PGRC)</option>
                  <option value="USR-APP-01">Dr. Sanjay Deshmukh (Approvals)</option>
                  <option value="USR-VIG-01">Shri V. K. Iyer (Vigilance)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assignment Remarks</label>
                <textarea
                  rows={3}
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  placeholder="Directives for preliminary scrutiny or notice issuance..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalType(null)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg">Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Transfer Bureau */}
      {modalType === 'TRANSFER' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-purple-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4" />
                Inter-Bureau Case Transfer
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleTransfer} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination Bureau *</label>
                <select
                  value={transferBureau}
                  onChange={(e) => setTransferBureau(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  <option value="BUR-RB">Regulation Bureau (RB) - Affiliations, norms, approvals</option>
                  <option value="BUR-PGRC">Public Grievance Redressal Cell (PGRC) - Student/Faculty</option>
                  <option value="BUR-APP">Approval Bureau - Intake capacity variations</option>
                  <option value="BUR-VIG">Vigilance Cell - Capitation fee & ethics inquiries</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transfer Rationale / Justification *</label>
                <textarea
                  required
                  rows={3}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Explain why jurisdiction belongs to receiving Bureau..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalType(null)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg">Execute Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Escalate to Management */}
      {modalType === 'ESCALATE' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-rose-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Escalate Case to Senior Management
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleEscalate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Escalation Justification *</label>
                <textarea
                  required
                  rows={3}
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="Specify statutory violation severity, non-responsiveness, or executive directive needed..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <p className="text-[11px] text-rose-600">
                Escalation will set Priority to URGENT and notify Senior Management & Member Secretary office.
              </p>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalType(null)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg">Confirm Escalation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Record Disposal */}
      {modalType === 'DISPOSE' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Record Formal Case Disposal
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleDispose} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution Category</label>
                <select
                  value={disposalType}
                  onChange={(e) => setDisposalType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="SATISFACTORY_COMPLIANCE">Satisfactory Institutional Compliance Verified</option>
                  <option value="GRIEVANCE_REDRESSED">Grievance Fully Redressed by College</option>
                  <option value="PENALTY_ENFORCED">Regulatory Penalty / Show-Cause Concluded</option>
                  <option value="MUTUALLY_RESOLVED">Mutually Resolved with Stakeholders</option>
                  <option value="REJECTED_UNFOUNDED">Found Unsubstantiated Upon Scrutiny</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Disposal Findings & Resolution Summary *</label>
                <textarea
                  required
                  rows={4}
                  value={disposalSummary}
                  onChange={(e) => setDisposalSummary(e.target.value)}
                  placeholder="Record formal disposal findings, committee directives, and closure timestamps..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalType(null)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Mark as Disposed</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

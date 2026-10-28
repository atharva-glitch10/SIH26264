import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRightLeft,
  Flame,
  ArrowRight,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Shield,
  Layers,
  ExternalLink,
  ChevronRight,
  History
} from 'lucide-react';
import { api } from '../services/api';
import { Institution, Case, CaseAction, OverlapAlert } from '../types';

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
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Clock className="w-8 h-8 animate-spin text-teal-600 mb-2" />
        <span className="text-sm font-medium">Aggregating Institution 360° Profile & Case History...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-slate-800">Institution Not Found</h2>
        <Link to="/institutions" className="text-xs text-teal-600 hover:underline mt-2 inline-block">
          Return to directory
        </Link>
      </div>
    );
  }

  const { institution, aliases, cases, overlap_alerts, timeline } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/institutions" className="hover:text-slate-800">Institutions</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-semibold text-slate-800">{institution.canonical_name}</span>
      </div>

      {/* Main Dossier Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-semibold">
                Permanent ID: {institution.aicte_permanent_id || 'NOT_ASSIGNED'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                Internal ID: {institution.institution_id}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                  institution.risk_level === 'HIGH'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : institution.risk_level === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {institution.risk_level} Attention
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {institution.canonical_name}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span className="font-medium text-slate-700">{institution.institution_type}</span>
              •
              <span>{institution.region} Region</span>
            </p>

            {aliases && aliases.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Known Aliases:</span>
                {aliases.map((al: any) => (
                  <span key={al.alias_id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                    {al.alias_name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Contact & Geographic Meta Card */}
          <div className="lg:border-l lg:border-slate-200 lg:pl-6 space-y-1.5 text-xs text-slate-600 shrink-0">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>{institution.district ? `${institution.district}, ` : ''}{institution.state}</span>
            </div>
            {institution.contact_email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{institution.contact_email}</span>
              </div>
            )}
            {institution.contact_phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{institution.contact_phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Registered in system: {new Date(institution.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Participating Bureaus Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Participating Bureaus & Cells:</span>
            <div className="flex flex-wrap gap-1.5">
              {institution.participating_bureaus?.map((b) => (
                <span
                  key={b}
                  className="px-2.5 py-1 rounded-md bg-slate-900 text-teal-400 text-xs font-mono font-medium shadow-sm"
                >
                  {b.replace('BUR-', '')}
                </span>
              ))}
            </div>
          </div>

          <Link
            to={`/cases?search=${encodeURIComponent(institution.canonical_name)}`}
            className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1"
          >
            Filter All Cases for this Institution
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Active Overlap Alert Card (if any) */}
      {overlap_alerts && overlap_alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-amber-950">
                    Active Potential Overlapping Cases Flagged ({overlap_alerts[0].alert_id})
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-semibold uppercase">
                    {overlap_alerts[0].status}
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1">{overlap_alerts[0].explanation}</p>
                <div className="mt-2 text-xs font-medium text-amber-900 bg-amber-100/70 p-2.5 rounded-lg border border-amber-200/70">
                  <strong>Recommended Coordination:</strong> {overlap_alerts[0].recommended_action}
                </div>
              </div>
            </div>
            <Link
              to={`/overlaps`}
              className="shrink-0 px-3 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-sm transition-colors flex items-center gap-1.5"
            >
              Open Overlap Hub
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-medium text-slate-500 block uppercase">Total Grievances</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{cases.length}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-medium text-slate-500 block uppercase">Under Process</span>
          <span className="text-xl font-bold text-teal-600 mt-1 block">
            {cases.filter(c => c.status === 'UNDER_PROCESS').length}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-medium text-slate-500 block uppercase">Pending Scrutiny</span>
          <span className="text-xl font-bold text-amber-600 mt-1 block">
            {cases.filter(c => c.status === 'PENDING' || c.status === 'RECEIVED').length}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-medium text-slate-500 block uppercase">Disposed Cases</span>
          <span className="text-xl font-bold text-emerald-600 mt-1 block">
            {cases.filter(c => c.status === 'DISPOSED' || c.status === 'CLOSED').length}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-medium text-slate-500 block uppercase">Escalations</span>
          <span className="text-xl font-bold text-rose-600 mt-1 block">
            {cases.filter(c => c.status === 'ESCALATED').length}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-medium text-slate-500 block uppercase">Overdue SLA</span>
          <span className="text-xl font-bold text-rose-600 mt-1 block">
            {cases.filter(c => c.is_overdue).length}
          </span>
        </div>
      </div>

      {/* Two Column Layout: Cases List on Left, Chronological Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cases Register for Institution */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Institution Case Dossier</h3>
                <p className="text-xs text-slate-500">All registered complaints across AICTE Bureaus</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                {cases.length} Total Records
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {cases.map((c) => (
                <div key={c.case_id} className="py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/50 p-2 rounded-lg transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/cases/${c.case_id}`} className="font-bold text-teal-700 hover:underline text-xs font-mono">
                        {c.complaint_reference}
                      </Link>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
                        {c.current_bureau_id.replace('BUR-', '')}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                          c.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-800'
                            : c.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.priority}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-medium">
                        {c.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {c.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Category: <strong className="text-slate-600">{c.category}</strong></span>
                      •
                      <span>Received: {new Date(c.received_at).toLocaleDateString()}</span>
                      •
                      <span className={c.is_overdue ? 'text-rose-600 font-semibold' : ''}>
                        {c.is_overdue ? 'Overdue Deadline' : `SLA: ${c.days_pending}d pending`}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/cases/${c.case_id}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors shrink-0"
                    title="View Case Details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Inter-Bureau Action Timeline */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-teal-600" />
              Unified Institutional Timeline
            </h3>
            <span className="text-[11px] text-slate-400">Chronological</span>
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.slice(0, 15).map((act, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white" />
                <div className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{act.action_type}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-teal-700 font-mono mt-0.5">
                    Case: {act.case_id}
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1 leading-snug">{act.remarks}</p>
                  {act.next_action && (
                    <div className="mt-1 text-[10px] text-slate-500 italic">
                      Next: {act.next_action}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

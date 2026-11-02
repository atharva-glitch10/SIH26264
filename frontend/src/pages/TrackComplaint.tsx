import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, ArrowRight, Building, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { PublicStatus } from '../types';

const fmt = (iso: string | null) => 
  (iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export const TrackComplaint: React.FC = () => {
  const [reference, setReference] = useState('');
  const [result, setResult] = useState<PublicStatus | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setBusy(true);
    try {
      setResult(await api.getPublicStatus(reference.trim()));
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'No complaint found for this reference number.' : 'Could not fetch status. Please verify the reference number.');
    } finally {
      setBusy(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'DISPOSED' || s === 'RESOLVED' || s === 'CLOSED') {
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    }
    if (s === 'UNDER_PROCESS' || s === 'PENDING') {
      return 'bg-blue-50 text-blue-800 border-blue-300';
    }
    if (s === 'ESCALATED') {
      return 'bg-amber-50 text-amber-800 border-amber-300';
    }
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center font-bold text-slate-950 shadow-md">
              AI
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">AICTE Grievance Portal</div>
              <div className="text-[11px] text-slate-400">All India Council for Technical Education · Ministry of Education</div>
            </div>
          </div>
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
          >
            Officer Sign In →
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-8 space-y-6">
          <div className="space-y-1.5 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand mb-2">
              <Shield className="w-6 h-6 text-brand" />
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900">
              Track Complaint Status
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Real-time statutory status tracker for grievances submitted to AICTE Bureau councils.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Statutory Reference Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full h-11 pl-4 pr-10 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 text-slate-900 transition-all shadow-xs"
                  placeholder="e.g. AICTE/PGRC/2026/00005"
                  required
                />
                <button
                  type="button"
                  onClick={() => setReference('AICTE/PGRC/2026/00005')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-brand hover:underline"
                >
                  Example
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full h-11 inline-flex items-center justify-center gap-2 px-5 text-sm font-semibold text-white bg-brand hover:bg-brand-hover rounded-xl shadow-md transition-all disabled:opacity-60 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              {busy ? 'Querying Records…' : 'Track Grievance'}
            </button>
          </form>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Status</span>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusBadge(result.status)}`}>
                  {result.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-slate-500 flex items-center gap-1.5 mb-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    Handling Bureau
                  </div>
                  <div className="font-semibold text-slate-900 font-mono text-sm">
                    {result.bureau_code || '—'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-slate-500 flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Received On
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">
                    {fmt(result.received_at)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div className="text-slate-500 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Resolution Due Date (Statutory SLA)
                </div>
                <div className="font-semibold text-slate-900">
                  {fmt(result.sla_due_at)}
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-950">
                <div className="font-semibold mb-1 text-blue-900">Latest Action / Case Note</div>
                <div className="text-slate-700 leading-relaxed">
                  {result.last_action_summary || 'Case registered and allocated to inquiry officer.'}
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 text-center text-xs text-slate-500">
            For urgent escalations or institutional verification, contact AICTE Central Helpdesk at <span className="font-mono text-slate-700">011-29581000</span>.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 px-6 py-4 text-center text-xs text-slate-500">
        All India Council for Technical Education (AICTE) · Nelson Mandela Marg, Vasant Kunj, New Delhi-110070
      </footer>
    </div>
  );
};

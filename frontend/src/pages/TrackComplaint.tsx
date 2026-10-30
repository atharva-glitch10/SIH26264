import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../services/api';
import { PublicStatus } from '../types';

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

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
      setError(err.response?.status === 404 ? 'No complaint found for this reference number.' : 'Could not fetch status. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const rows: [string, string][] = result
    ? [
        ['Status', result.status.replace(/_/g, ' ')],
        ['Handling bureau', result.bureau_code || '—'],
        ['Received on', fmt(result.received_at)],
        ['Resolution due by', fmt(result.sla_due_at)],
        ['Latest update', result.last_action_summary || '—'],
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-xl font-bold text-slate-900">Track your complaint</h1>
        <p className="text-xs text-slate-500 mt-1">Enter the reference number you received, e.g. AICTE/PGRC/2026/00005.</p>
        <form onSubmit={submit} className="mt-6 flex gap-2">
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Complaint reference number"
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-60"
          >
            <Search className="w-4 h-4" />
            {busy ? 'Checking…' : 'Track'}
          </button>
        </form>
        {error && <div className="mt-4 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</div>}
        {result && (
          <dl className="mt-4 border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-3 py-2">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-900 text-right">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-6 text-xs text-center">
          <Link to="/login" className="text-teal-700 hover:underline">Officer sign in</Link>
        </div>
      </div>
    </div>
  );
};

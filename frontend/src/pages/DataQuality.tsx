import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Building2,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import { MatchingQueueItem } from '../types';

export const DataQuality: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<MatchingQueueItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  // Interactive Test Matcher State
  const [testRawName, setTestRawName] = useState('Fictional Inst Alpha Technolog');
  const [testPermanentId, setTestPermanentId] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    loadQueue();
  }, [statusFilter]);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await api.getMatchingReviewQueue(statusFilter);
      setQueue(data);
    } catch (e) {
      console.error('Failed to load matching review queue', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDecision = async (matchId: number, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await api.reviewMatchingQueueItem(matchId, {
        decision,
        create_alias: true,
        reviewer_id: 'USR-SUPER-01'
      });
      loadQueue();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRawName.trim()) return;
    setTestLoading(true);
    try {
      const res = await api.matchInstitution({
        raw_name: testRawName.trim(),
        aicte_permanent_id: testPermanentId.trim() || undefined
      });
      setTestResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Data Quality & Institution Disambiguation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hierarchical deterministic and RapidFuzz token matching pipeline preventing silent record merging.
          </p>
        </div>

        <button
          onClick={loadQueue}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Refresh Review Queue
        </button>
      </div>

      {/* Interactive RapidFuzz Evaluator Sandbox */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Institution Matcher Sandbox
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            RapidFuzz token_sort_ratio / Ambiguity Check
          </span>
        </div>

        <form onSubmit={handleTestMatch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Raw Complainant Input Name
            </label>
            <input
              type="text"
              required
              value={testRawName}
              onChange={(e) => setTestRawName(e.target.value)}
              placeholder="e.g. Fictional Inst Alpha Technolog"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Optional AICTE Permanent ID
            </label>
            <input
              type="text"
              value={testPermanentId}
              onChange={(e) => setTestPermanentId(e.target.value)}
              placeholder="e.g. 1-4329811"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-slate-800"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={testLoading}
              className="w-full py-2 px-3 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
            >
              {testLoading ? 'Evaluating...' : 'Test Matching'}
            </button>
          </div>
        </form>

        {testResult && (
          <div className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-150 ${
            testResult.matched
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                {testResult.matched ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                {testResult.matched ? 'Auto-Matched Successfully' : 'Requires Manual Review / Flagged'}
              </span>
              <span className="font-mono font-bold text-xs">
                Score: {testResult.confidence_score?.toFixed(1)}% ({testResult.matching_method})
              </span>
            </div>

            <p className="leading-snug">{testResult.details}</p>
            {testResult.institution_id && (
              <div className="pt-1 text-[11px] font-mono">
                Matched Institution ID: <strong>{testResult.institution_id}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Fuzzy Match Verification Queue
            </h3>
            <p className="text-xs text-slate-500">
              Submissions scoring 75-89% or with ambiguous candidate separation are queued for registrar verification.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Raw Input College Name</th>
                <th className="py-3 px-4">Candidate Institution (Matched)</th>
                <th className="py-3 px-4 text-center">Score %</th>
                <th className="py-3 px-4">Match Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Review Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading queue...</td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No items in queue with status {statusFilter}.
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item.match_id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      "{item.raw_input_name}"
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{item.candidate_institution_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        PID: {item.candidate_permanent_id || 'N/A'} • ID: {item.candidate_institution_id}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {item.confidence_score.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {item.matching_method}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        item.decision_status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.decision_status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.decision_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.decision_status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReviewDecision(item.match_id, 'APPROVED')}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1"
                            title="Approve match and register alias"
                          >
                            <Check className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewDecision(item.match_id, 'REJECTED')}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1"
                            title="Reject candidate match"
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Decided</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

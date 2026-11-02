import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, Check, X, ShieldCheck, AlertCircle, Building2, Search } from 'lucide-react';
import { api } from '../services/api';
import { MatchingQueueItem } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Tag, { TagTone } from '../components/ui/Tag';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, THead, Th, Td, Tr } from '../components/ui/Table';

const decisionTone = (s: string): TagTone => (s === 'APPROVED' ? 'ok' : s === 'REJECTED' ? 'bad' : 'warn');

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
      <PageHeader
        title="Data Quality & Institution Disambiguation"
        description="Deterministic alias matching and fuzzy token similarity to prevent silent record fragmentation and false merges."
        actions={
          <Button variant="secondary" size="sm" onClick={loadQueue}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh Queue
          </Button>
        }
      />

      <Card className="shadow-xs border-slate-200">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              <span>Interactive Matcher Sandbox</span>
            </div>
          }
          actions={<span className="text-xs text-slate-500 font-medium">Weighted token overlap & Levenshtein engine</span>}
        />
        <CardBody className="space-y-4">
          <form onSubmit={handleTestMatch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Raw Complainant Input Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={testRawName}
                  onChange={(e) => setTestRawName(e.target.value)}
                  placeholder="e.g. Fictional Inst Alpha Technolog"
                  className="w-full h-10 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-xs"
                />
              </div>
            </div>
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Optional AICTE Permanent ID
              </label>
              <input
                type="text"
                value={testPermanentId}
                onChange={(e) => setTestPermanentId(e.target.value)}
                placeholder="e.g. 1-4329811"
                className="w-full h-10 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={testLoading} variant="cta" className="w-full h-10">
                {testLoading ? 'Evaluating…' : 'Test Match'}
              </Button>
            </div>
          </form>

          {testResult && (
            <div
              className={`p-4 rounded-xl border text-sm space-y-2.5 transition-all ${
                testResult.matched 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  {testResult.matched ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>
                    {testResult.matched ? 'Confident Auto-Match' : 'Queued for Manual Registrar Review'}
                  </span>
                </div>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-white/80 border border-slate-200 shadow-xs">
                  Score: {testResult.confidence_score?.toFixed(1)}% · {testResult.matching_method}
                </span>
              </div>
              <p className="leading-relaxed text-xs text-slate-700">{testResult.details}</p>
              {testResult.institution_id && (
                <div className="text-xs flex items-center gap-2 pt-1">
                  <span className="text-slate-500">Matched Canonical Institution ID:</span>
                  <span className="font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-900 border border-slate-200">
                    {testResult.institution_id}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="overflow-hidden shadow-xs border-slate-200">
        <CardHeader
          title="Fuzzy Match Verification Queue"
          actions={
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80">
              {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => {
                const active = statusFilter === st;
                return (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    aria-pressed={active}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      active
                        ? 'bg-white text-brand shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          }
        />
        <div className="px-5 py-2.5 text-xs text-slate-500 bg-slate-50/60 border-b border-slate-200">
          Submissions scoring 75–89% or with ambiguous candidate separation are queued for registrar verification to avoid inadvertent data contamination.
        </div>

        <Table>
          <THead>
            <tr>
              <Th>Raw Input Name</Th>
              <Th>Candidate Institution (Proposed)</Th>
              <Th align="right">Score %</Th>
              <Th>Match Method</Th>
              <Th>Status</Th>
              <Th align="right">Review Decision</Th>
            </tr>
          </THead>
          <tbody>
            {loading ? (
              <tr>
                <Td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    <span>Loading verification queue…</span>
                  </div>
                </Td>
              </tr>
            ) : queue.length === 0 ? (
              <tr>
                <Td colSpan={6} className="py-12 text-center text-slate-500">
                  No queue items currently found with status <span className="font-semibold text-slate-700">{statusFilter}</span>.
                </Td>
              </tr>
            ) : (
              queue.map((item) => (
                <Tr key={item.match_id}>
                  <Td className="font-medium text-slate-900">
                    <span className="italic font-serif text-slate-800">"{item.raw_input_name}"</span>
                  </Td>
                  <Td>
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {item.candidate_institution_name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      PID: {item.candidate_permanent_id || '—'} · Code: {item.candidate_institution_id}
                    </div>
                  </Td>
                  <Td align="right" className="tabular-nums font-semibold text-slate-900">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      item.confidence_score >= 85 ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {item.confidence_score.toFixed(1)}%
                    </span>
                  </Td>
                  <Td className="text-xs font-mono text-slate-500">{item.matching_method}</Td>
                  <Td><Tag tone={decisionTone(item.decision_status)}>{item.decision_status}</Tag></Td>
                  <Td align="right">
                    {item.decision_status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          size="sm" 
                          title="Approve match and register alias" 
                          onClick={() => handleReviewDecision(item.match_id, 'APPROVED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          title="Reject candidate match" 
                          onClick={() => handleReviewDecision(item.match_id, 'REJECTED')}
                          className="hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 italic">Decided</span>
                    )}
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

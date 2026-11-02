import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { RefreshCw, Sparkles, Check, X, ShieldCheck, AlertCircle, Building2, Search } from 'lucide-react';
=======
import { RefreshCw } from 'lucide-react';
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
import { api } from '../services/api';
import { MatchingQueueItem } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Tag, { TagTone } from '../components/ui/Tag';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, THead, Th, Td, Tr } from '../components/ui/Table';

<<<<<<< HEAD
=======
const inputClass = 'w-full h-9 px-3 text-[13px] bg-white border border-line rounded-sm text-ink placeholder:text-muted';
const labelClass = 'block text-[12px] font-medium text-ink mb-1';
const toggleClass = (active: boolean) =>
  `h-8 px-2.5 text-[12px] font-medium rounded-sm border ${
    active ? 'bg-brand text-white border-brand' : 'bg-white text-ink border-line hover:bg-page'
  }`;

>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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
<<<<<<< HEAD
        title="Data Quality & Institution Disambiguation"
        description="Deterministic alias matching and fuzzy token similarity to prevent silent record fragmentation and false merges."
        actions={
          <Button variant="secondary" size="sm" onClick={loadQueue}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh Queue
=======
        title="Data Quality and Institution Disambiguation"
        description="Deterministic and fuzzy token matching that prevents silent record merging."
        actions={
          <Button variant="secondary" size="sm" onClick={loadQueue}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh review queue
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          </Button>
        }
      />

<<<<<<< HEAD
      <Card className="shadow-xs border-slate-200">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              <span>Interactive Matcher Sandbox</span>
            </div>
          }
          actions={<span className="text-xs text-slate-500 font-medium">Weighted token overlap & Levenshtein engine</span>}
=======
      <Card>
        <CardHeader
          title="Institution matcher sandbox"
          actions={<span className="text-[12px] text-muted">Fuzzy token matching with ambiguity check</span>}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
        />
        <CardBody className="space-y-4">
          <form onSubmit={handleTestMatch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6">
<<<<<<< HEAD
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
=======
              <label className={labelClass}>Raw complainant input name</label>
              <input
                type="text"
                required
                value={testRawName}
                onChange={(e) => setTestRawName(e.target.value)}
                placeholder="e.g. Fictional Inst Alpha Technolog"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-4">
              <label className={labelClass}>Optional AICTE permanent ID</label>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              <input
                type="text"
                value={testPermanentId}
                onChange={(e) => setTestPermanentId(e.target.value)}
                placeholder="e.g. 1-4329811"
<<<<<<< HEAD
                className="w-full h-10 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={testLoading} variant="cta" className="w-full h-10">
                {testLoading ? 'Evaluating…' : 'Test Match'}
=======
                className={`${inputClass} font-mono`}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={testLoading} className="w-full">
                {testLoading ? 'Evaluating...' : 'Test matching'}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              </Button>
            </div>
          </form>

          {testResult && (
            <div
<<<<<<< HEAD
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
=======
              className={`p-4 rounded-sm border text-[13px] space-y-2 ${
                testResult.matched ? 'bg-ok/5 border-ok/30' : 'bg-warn/5 border-warn/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {testResult.matched ? 'Auto-matched' : 'Requires manual review / flagged'}
                </span>
                <span className="text-[12px]">
                  Score: {testResult.confidence_score?.toFixed(1)}% ({testResult.matching_method})
                </span>
              </div>
              <p className="leading-snug">{testResult.details}</p>
              {testResult.institution_id && (
                <div className="text-[12px]">
                  Matched institution ID: <strong>{testResult.institution_id}</strong>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

<<<<<<< HEAD
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
=======
      <Card className="overflow-hidden">
        <CardHeader
          title="Fuzzy match verification queue"
          actions={
            <div className="flex items-center gap-1.5">
              {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  aria-pressed={statusFilter === st}
                  className={toggleClass(statusFilter === st)}
                >
                  {st}
                </button>
              ))}
            </div>
          }
        />
        <p className="px-4 py-2 text-[12px] text-muted border-b border-line">
          Submissions scoring 75–89% or with ambiguous candidate separation are queued for registrar verification.
        </p>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

        <Table>
          <THead>
            <tr>
<<<<<<< HEAD
              <Th>Raw Input Name</Th>
              <Th>Candidate Institution (Proposed)</Th>
              <Th align="right">Score %</Th>
              <Th>Match Method</Th>
              <Th>Status</Th>
              <Th align="right">Review Decision</Th>
=======
              <Th>Raw input college name</Th>
              <Th>Candidate institution (matched)</Th>
              <Th align="right">Score %</Th>
              <Th>Match method</Th>
              <Th>Status</Th>
              <Th align="right">Review decision</Th>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            </tr>
          </THead>
          <tbody>
            {loading ? (
              <tr>
<<<<<<< HEAD
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
=======
                <Td colSpan={6} className="py-8 text-center text-muted">Loading queue...</Td>
              </tr>
            ) : queue.length === 0 ? (
              <tr>
                <Td colSpan={6} className="py-8 text-center text-muted">No items in queue with status {statusFilter}.</Td>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
              </tr>
            ) : (
              queue.map((item) => (
                <Tr key={item.match_id}>
<<<<<<< HEAD
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
=======
                  <Td className="font-medium">"{item.raw_input_name}"</Td>
                  <Td>
                    <div className="font-medium">{item.candidate_institution_name}</div>
                    <div className="text-[12px] text-muted">
                      PID: {item.candidate_permanent_id || 'N/A'} · ID: {item.candidate_institution_id}
                    </div>
                  </Td>
                  <Td align="right" className="tabular-nums font-medium">{item.confidence_score.toFixed(1)}%</Td>
                  <Td className="text-[12px] text-muted">{item.matching_method}</Td>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                  <Td><Tag tone={decisionTone(item.decision_status)}>{item.decision_status}</Tag></Td>
                  <Td align="right">
                    {item.decision_status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-1.5">
<<<<<<< HEAD
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
=======
                        <Button size="sm" title="Approve match and register alias" onClick={() => handleReviewDecision(item.match_id, 'APPROVED')}>
                          Approve
                        </Button>
                        <Button size="sm" variant="secondary" title="Reject candidate match" onClick={() => handleReviewDecision(item.match_id, 'REJECTED')}>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                          Reject
                        </Button>
                      </div>
                    ) : (
<<<<<<< HEAD
                      <span className="text-xs font-medium text-slate-400 italic">Decided</span>
=======
                      <span className="text-[12px] text-muted">Decided</span>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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

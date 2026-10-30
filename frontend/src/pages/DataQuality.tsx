import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { MatchingQueueItem } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Tag, { TagTone } from '../components/ui/Tag';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, Th, Td, Tr } from '../components/ui/DataTable';
import { inputClass, labelClass, toggleClass } from '../components/ui/styles';

const decisionTone = (s: string): TagTone => (s === 'APPROVED' ? 'success' : s === 'REJECTED' ? 'danger' : 'warning');

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
        title="Data Quality and Institution Disambiguation"
        description="Deterministic and fuzzy token matching that prevents silent record merging."
        actions={
          <Button variant="secondary" size="sm" onClick={loadQueue}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh review queue
          </Button>
        }
      />

      <Card>
        <CardHeader
          title="Institution matcher sandbox"
          actions={<span className="text-xs text-muted">Fuzzy token matching with ambiguity check</span>}
        />
        <CardBody className="space-y-4">
          <form onSubmit={handleTestMatch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6">
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
              <input
                type="text"
                value={testPermanentId}
                onChange={(e) => setTestPermanentId(e.target.value)}
                placeholder="e.g. 1-4329811"
                className={`${inputClass} font-mono`}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={testLoading} className="w-full">
                {testLoading ? 'Evaluating...' : 'Test matching'}
              </Button>
            </div>
          </form>

          {testResult && (
            <div
              className={`p-4 rounded-sm border text-sm space-y-2 ${
                testResult.matched ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {testResult.matched ? 'Auto-matched' : 'Requires manual review / flagged'}
                </span>
                <span className="text-xs">
                  Score: {testResult.confidence_score?.toFixed(1)}% ({testResult.matching_method})
                </span>
              </div>
              <p className="leading-snug">{testResult.details}</p>
              {testResult.institution_id && (
                <div className="text-xs">
                  Matched institution ID: <strong>{testResult.institution_id}</strong>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

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
                  className={`${toggleClass(statusFilter === st)} !h-8 !text-xs`}
                >
                  {st}
                </button>
              ))}
            </div>
          }
        />
        <p className="px-4 py-2 text-xs text-muted border-b border-border">
          Submissions scoring 75–89% or with ambiguous candidate separation are queued for registrar verification.
        </p>

        <Table>
          <thead>
            <tr>
              <Th>Raw input college name</Th>
              <Th>Candidate institution (matched)</Th>
              <Th className="text-right">Score %</Th>
              <Th>Match method</Th>
              <Th>Status</Th>
              <Th className="text-right">Review decision</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted">Loading queue...</td>
              </tr>
            ) : queue.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted">No items in queue with status {statusFilter}.</td>
              </tr>
            ) : (
              queue.map((item) => (
                <Tr key={item.match_id}>
                  <Td className="font-medium">"{item.raw_input_name}"</Td>
                  <Td>
                    <div className="font-medium">{item.candidate_institution_name}</div>
                    <div className="text-xs text-muted">
                      PID: {item.candidate_permanent_id || 'N/A'} · ID: {item.candidate_institution_id}
                    </div>
                  </Td>
                  <Td className="text-right tabular-nums font-medium">{item.confidence_score.toFixed(1)}%</Td>
                  <Td className="text-xs text-muted">{item.matching_method}</Td>
                  <Td><Tag tone={decisionTone(item.decision_status)}>{item.decision_status}</Tag></Td>
                  <Td className="text-right">
                    {item.decision_status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" title="Approve match and register alias" onClick={() => handleReviewDecision(item.match_id, 'APPROVED')}>
                          Approve
                        </Button>
                        <Button size="sm" variant="secondary" title="Reject candidate match" onClick={() => handleReviewDecision(item.match_id, 'REJECTED')}>
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">Decided</span>
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

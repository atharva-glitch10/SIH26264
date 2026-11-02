import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
import { RefreshCw, GitBranch, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
=======
import { RefreshCw } from 'lucide-react';
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
import { api } from '../services/api';
import { Case } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import { Card } from '../components/ui/Card';
import { Table, THead, Th, Td, Tr } from '../components/ui/Table';

<<<<<<< HEAD
const BUREAU_COLORS: Record<string, string> = {
  RB: 'bg-blue-50 text-blue-700 border-blue-200/80',
  PGRC: 'bg-purple-50 text-purple-700 border-purple-200/80',
  APP: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  APPROVAL: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  VIG: 'bg-rose-50 text-rose-700 border-rose-200/80',
  VIGILANCE: 'bg-rose-50 text-rose-700 border-rose-200/80',
};
=======
const tabClass = (active: boolean) =>
  `px-4 py-2 text-[13px] font-medium border-b-2 -mb-px ${
    active ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'
  }`;
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

export const Workflow: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [transferredCases, setTransferredCases] = useState<Case[]>([]);
  const [escalatedCases, setEscalatedCases] = useState<Case[]>([]);
  const [activeTab, setActiveTab] = useState<'TRANSFERS' | 'ESCALATIONS'>('TRANSFERS');

  useEffect(() => {
    loadWorkflowCases();
  }, []);

  const loadWorkflowCases = async () => {
    setLoading(true);
    try {
      const [transfersRes, escalationsRes] = await Promise.all([
        api.getCases({ status: 'TRANSFERRED', page_size: 50 }),
<<<<<<< HEAD
        api.getCases({ status: 'ESCALATED', page_size: 50 }),
=======
        api.getCases({ status: 'ESCALATED', page_size: 50 })
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      ]);
      setTransferredCases(transfersRes.items);
      setEscalatedCases(escalationsRes.items);
    } catch (e) {
      console.error('Failed to load workflow cases', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Workflow, Transfers and Escalations Monitor"
<<<<<<< HEAD
        description="Inter-bureau case handovers, jurisdiction reassignments, and executive escalations."
        actions={
          <Button variant="secondary" size="sm" onClick={loadWorkflowCases} className="bg-white">
=======
        description="Inter-bureau case handovers, jurisdiction reassignments and executive escalations."
        actions={
          <Button variant="secondary" size="sm" onClick={loadWorkflowCases}>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh pipeline
          </Button>
        }
      />

<<<<<<< HEAD
      {/* Modern Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-fit">
        <button
          onClick={() => setActiveTab('TRANSFERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'TRANSFERS'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          Transferred Cases Pipeline ({transferredCases.length})
        </button>
        <button
          onClick={() => setActiveTab('ESCALATIONS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'ESCALATIONS'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          Management Escalations Monitor ({escalatedCases.length})
=======
      <div className="flex items-center gap-2 border-b border-line">
        <button onClick={() => setActiveTab('TRANSFERS')} className={tabClass(activeTab === 'TRANSFERS')}>
          Transferred cases pipeline ({transferredCases.length})
        </button>
        <button onClick={() => setActiveTab('ESCALATIONS')} className={tabClass(activeTab === 'ESCALATIONS')}>
          Management escalations monitor ({escalatedCases.length})
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
        </button>
      </div>

      {loading ? (
<<<<<<< HEAD
        <Card className="p-16 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading workflow queues…
        </Card>
      ) : activeTab === 'TRANSFERS' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-blue-200/90 bg-blue-50/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <GitBranch className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-800">
                <strong className="font-semibold text-slate-900">Inter-Bureau Handover Policy:</strong> Transferred cases retain full prior ownership history and require acknowledgment by the receiving Bureau Head.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600 text-white shrink-0">
              {transferredCases.length} pending handover
            </span>
=======
        <Card className="p-12 text-center text-muted text-[13px]">Loading workflow queues...</Card>
      ) : activeTab === 'TRANSFERS' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-md border border-line bg-white text-[13px] flex items-center justify-between gap-4">
            <div>
              <span className="font-medium">Inter-bureau handover policy:</span> transferred cases retain full prior ownership history and require acknowledgment by the receiving Bureau Head.
            </div>
            <Tag tone="info">{transferredCases.length} pending handover</Tag>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          </div>

          <Card className="overflow-hidden">
            <Table>
              <THead>
                <tr>
<<<<<<< HEAD
                  <Th>Case Reference & ID</Th>
                  <Th>Institution Name</Th>
                  <Th>Transfer Direction</Th>
                  <Th>Category</Th>
                  <Th>Last Action / Reason</Th>
                  <Th>Next Required Action</Th>
=======
                  <Th>Case reference / ID</Th>
                  <Th>Institution name</Th>
                  <Th>Transfer direction</Th>
                  <Th>Category</Th>
                  <Th>Last action / reason</Th>
                  <Th>Next required action</Th>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                  <Th align="right">Action</Th>
                </tr>
              </THead>
              <tbody>
                {transferredCases.length === 0 ? (
                  <tr>
<<<<<<< HEAD
                    <Td colSpan={7} className="p-12 text-center text-slate-400">
                      No active transferred cases currently in queue.
                    </Td>
                  </tr>
                ) : (
                  transferredCases.map((c) => {
                    const cleanB = c.current_bureau_id.replace('BUR-', '');
                    return (
                      <Tr key={c.case_id}>
                        <Td>
                          <Link
                            to={`/cases/${c.case_id}`}
                            className="font-semibold font-mono text-xs text-blue-600 hover:underline block"
                          >
                            {c.complaint_reference}
                          </Link>
                          <span className="text-[11px] font-mono text-slate-400">{c.case_id}</span>
                        </Td>
                        <Td className="max-w-xs">
                          <Link
                            to={`/institutions/${c.institution_id}`}
                            className="font-medium text-slate-900 hover:text-blue-600 block truncate"
                          >
                            {c.institution_name}
                          </Link>
                        </Td>
                        <Td>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                            <span>Origin</span>
                            <span>→</span>
                            <strong className="text-blue-700">{cleanB}</strong>
                          </span>
                        </Td>
                        <Td>
                          <span className="text-xs text-slate-800 font-medium">{c.category}</span>
                        </Td>
                        <Td>
                          <p className="text-xs text-slate-700 line-clamp-2">{c.last_action_summary || 'N/A'}</p>
                          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                            {new Date(c.last_action_at).toLocaleDateString()}
                          </span>
                        </Td>
                        <Td>
                          <span className="text-xs font-medium text-slate-800 line-clamp-2">
                            {c.next_action || 'Pending officer review'}
                          </span>
                        </Td>
                        <Td align="right">
                          <Link
                            to={`/cases/${c.case_id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                          >
                            Review case
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </Link>
                        </Td>
                      </Tr>
                    );
                  })
=======
                    <Td colSpan={7} className="p-8 text-center text-muted">No active transferred cases currently in queue.</Td>
                  </tr>
                ) : (
                  transferredCases.map((c) => (
                    <Tr key={c.case_id}>
                      <Td>
                        <Link to={`/cases/${c.case_id}`} className="font-medium text-brand hover:underline">{c.complaint_reference}</Link>
                        <div className="text-[12px] text-muted">{c.case_id}</div>
                      </Td>
                      <Td className="max-w-xs truncate font-medium">{c.institution_name}</Td>
                      <Td>
                        <div className="flex items-center gap-1.5">
                          <Tag>{c.source_bureau_id.replace('BUR-', '')}</Tag>
                          <span className="text-muted">→</span>
                          <Tag tone="info">{c.current_bureau_id.replace('BUR-', '')}</Tag>
                        </div>
                      </Td>
                      <Td className="text-muted">{c.category}</Td>
                      <Td className="max-w-xs">
                        <div className="truncate">{c.last_action_summary}</div>
                        <div className="text-[12px] text-muted">{new Date(c.last_action_at).toLocaleDateString()}</div>
                      </Td>
                      <Td>{c.next_action || 'Pending'}</Td>
                      <Td align="right">
                        <Link to={`/cases/${c.case_id}`} className="text-brand hover:underline">Review case</Link>
                      </Td>
                    </Tr>
                  ))
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                )}
              </tbody>
            </Table>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
<<<<<<< HEAD
          <div className="p-4 rounded-xl border border-rose-200/90 bg-rose-50/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-slate-800">
                <strong className="font-semibold text-slate-900">Executive Escalation Protocol:</strong> Cases flagged here have breached SLA targets or represent high-risk institutional compliance issues requiring Senior Management intervention.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shrink-0">
              {escalatedCases.length} urgent escalations
            </span>
=======
          <div className="p-4 rounded-md border border-line bg-white text-[13px] flex items-center justify-between gap-4">
            <div>
              <span className="font-medium">Escalation directive:</span> escalated cases bypass normal queues and require priority hearing or Member Secretary directives.
            </div>
            <Tag tone="bad">{escalatedCases.length} escalated cases</Tag>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          </div>

          <Card className="overflow-hidden">
            <Table>
              <THead>
                <tr>
<<<<<<< HEAD
                  <Th>Case Reference & ID</Th>
                  <Th>Institution Name</Th>
                  <Th>Current Bureau</Th>
                  <Th>Urgency & Days</Th>
                  <Th>Escalation Justification</Th>
                  <Th>Assigned Officer</Th>
=======
                  <Th>Case reference / ID</Th>
                  <Th>Institution name</Th>
                  <Th>Bureau</Th>
                  <Th>Category</Th>
                  <Th>Escalation summary</Th>
                  <Th align="right">Days elapsed</Th>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                  <Th align="right">Action</Th>
                </tr>
              </THead>
              <tbody>
                {escalatedCases.length === 0 ? (
                  <tr>
<<<<<<< HEAD
                    <Td colSpan={7} className="p-12 text-center text-slate-400">
                      No active escalated cases in queue.
                    </Td>
                  </tr>
                ) : (
                  escalatedCases.map((c) => {
                    const cleanB = c.current_bureau_id.replace('BUR-', '');
                    return (
                      <Tr key={c.case_id}>
                        <Td>
                          <Link
                            to={`/cases/${c.case_id}`}
                            className="font-semibold font-mono text-xs text-rose-600 hover:underline block"
                          >
                            {c.complaint_reference}
                          </Link>
                          <span className="text-[11px] font-mono text-slate-400">{c.case_id}</span>
                        </Td>
                        <Td className="max-w-xs">
                          <Link
                            to={`/institutions/${c.institution_id}`}
                            className="font-medium text-slate-900 hover:text-blue-600 block truncate"
                          >
                            {c.institution_name}
                          </Link>
                        </Td>
                        <Td>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {cleanB}
                          </span>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-1.5">
                            <Tag tone="bad">ESCALATED</Tag>
                          </div>
                          <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
                            {c.days_pending}d pending filing
                          </div>
                        </Td>
                        <Td className="max-w-sm">
                          <p className="text-xs text-slate-700 leading-snug line-clamp-2">
                            {c.last_action_summary || c.description}
                          </p>
                        </Td>
                        <Td>
                          <span className="text-xs text-slate-800 font-medium">
                            {c.assigned_user_name || 'Unassigned'}
                          </span>
                        </Td>
                        <Td align="right">
                          <Link
                            to={`/cases/${c.case_id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-700 transition-colors shadow-2xs"
                          >
                            Intervene
                            <ArrowRight className="w-3 h-3 text-rose-400" />
                          </Link>
                        </Td>
                      </Tr>
                    );
                  })
=======
                    <Td colSpan={7} className="p-8 text-center text-muted">No escalated cases in queue.</Td>
                  </tr>
                ) : (
                  escalatedCases.map((c) => (
                    <Tr key={c.case_id}>
                      <Td>
                        <Link to={`/cases/${c.case_id}`} className="font-medium text-brand hover:underline">{c.complaint_reference}</Link>
                        <div className="text-[12px] text-muted">{c.case_id}</div>
                      </Td>
                      <Td className="max-w-xs truncate font-medium">{c.institution_name}</Td>
                      <Td><Tag>{c.current_bureau_id.replace('BUR-', '')}</Tag></Td>
                      <Td className="text-muted">{c.category}</Td>
                      <Td className="max-w-xs">{c.last_action_summary}</Td>
                      <Td align="right" className="tabular-nums">{c.days_pending}</Td>
                      <Td align="right">
                        <Link to={`/cases/${c.case_id}`} className="text-brand hover:underline">Urgent hearing</Link>
                      </Td>
                    </Tr>
                  ))
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                )}
              </tbody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
};
<<<<<<< HEAD

export default Workflow;
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

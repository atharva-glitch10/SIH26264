import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  ArrowRightLeft,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ArrowRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Case } from '../types';

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
        api.getCases({ status: 'ESCALATED', page_size: 50 })
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Workflow, Transfers & Escalations Monitor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time inter-bureau case handovers, jurisdiction reassignments, and executive escalations tracking.
          </p>
        </div>

        <button
          onClick={loadWorkflowCases}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Refresh Pipeline
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('TRANSFERS')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'TRANSFERS'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Transferred Cases Pipeline ({transferredCases.length})
        </button>

        <button
          onClick={() => setActiveTab('ESCALATIONS')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'ESCALATIONS'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4" />
          Management Escalations Monitor ({escalatedCases.length})
        </button>
      </div>

      {/* Main Content View */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
          Loading workflow queues...
        </div>
      ) : activeTab === 'TRANSFERS' ? (
        <div className="space-y-4">
          <div className="bg-purple-50/50 border border-purple-200 p-4 rounded-xl text-xs text-purple-900 flex items-center justify-between">
            <div>
              <strong>Inter-Bureau Handover Policy:</strong> Transferred cases retain full prior ownership history and require acknowledgment by the receiving Bureau Head.
            </div>
            <span className="font-mono text-purple-700 font-bold">{transferredCases.length} Pending Handover</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Case Reference / ID</th>
                  <th className="py-3 px-4">Institution Name</th>
                  <th className="py-3 px-4">Transfer Direction</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Last Action / Reason</th>
                  <th className="py-3 px-4">Next Required Action</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transferredCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No active transferred cases currently in queue.
                    </td>
                  </tr>
                ) : (
                  transferredCases.map((c) => (
                    <tr key={c.case_id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                        <Link to={`/cases/${c.case_id}`} className="hover:underline">
                          {c.complaint_reference}
                        </Link>
                        <div className="text-[10px] text-slate-400 font-normal">{c.case_id}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate font-medium text-slate-900">
                        {c.institution_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {c.source_bureau_id.replace('BUR-', '')}
                          </span>
                          <ArrowRight className="w-3 h-3 text-purple-500" />
                          <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                            {c.current_bureau_id.replace('BUR-', '')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{c.category}</td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-700">
                        <div className="truncate font-medium">{c.last_action_summary}</div>
                        <div className="text-[10px] text-slate-400">{new Date(c.last_action_at).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3.5 px-4 text-purple-700 font-medium">{c.next_action || 'Pending'}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/cases/${c.case_id}`}
                          className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100"
                        >
                          Review Case
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-rose-50/50 border border-rose-200 p-4 rounded-xl text-xs text-rose-900 flex items-center justify-between">
            <div>
              <strong>Escalation Directive:</strong> Escalated cases bypass normal queues and require priority hearing or Member Secretary directives.
            </div>
            <span className="font-mono text-rose-700 font-bold">{escalatedCases.length} Escalated Cases</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Case Reference / ID</th>
                  <th className="py-3 px-4">Institution Name</th>
                  <th className="py-3 px-4">Bureau</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Escalation Summary</th>
                  <th className="py-3 px-4">Days Elapsed</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {escalatedCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No escalated cases in queue.
                    </td>
                  </tr>
                ) : (
                  escalatedCases.map((c) => (
                    <tr key={c.case_id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-700">
                        <Link to={`/cases/${c.case_id}`} className="hover:underline">
                          {c.complaint_reference}
                        </Link>
                        <div className="text-[10px] text-slate-400 font-normal">{c.case_id}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate font-medium text-slate-900">
                        {c.institution_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {c.current_bureau_id.replace('BUR-', '')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{c.category}</td>
                      <td className="py-3.5 px-4 max-w-xs text-rose-900 font-medium">
                        {c.last_action_summary}
                      </td>
                      <td className="py-3.5 px-4 text-rose-600 font-bold">
                        {c.days_pending} Days
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/cases/${c.case_id}`}
                          className="px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100"
                        >
                          Urgent Hearing
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

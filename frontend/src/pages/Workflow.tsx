import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { Case } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import { Card } from '../components/ui/Card';
import { Table, Th, Td, Tr } from '../components/ui/DataTable';

const tabClass = (active: boolean) =>
  `px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
    active ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'
  }`;

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
      <PageHeader
        title="Workflow, Transfers and Escalations Monitor"
        description="Inter-bureau case handovers, jurisdiction reassignments and executive escalations."
        actions={
          <Button variant="secondary" size="sm" onClick={loadWorkflowCases}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh pipeline
          </Button>
        }
      />

      <div className="flex items-center gap-2 border-b border-border">
        <button onClick={() => setActiveTab('TRANSFERS')} className={tabClass(activeTab === 'TRANSFERS')}>
          Transferred cases pipeline ({transferredCases.length})
        </button>
        <button onClick={() => setActiveTab('ESCALATIONS')} className={tabClass(activeTab === 'ESCALATIONS')}>
          Management escalations monitor ({escalatedCases.length})
        </button>
      </div>

      {loading ? (
        <Card className="p-12 text-center text-muted text-sm">Loading workflow queues...</Card>
      ) : activeTab === 'TRANSFERS' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-md border border-border bg-surface text-sm flex items-center justify-between gap-4">
            <div>
              <span className="font-medium">Inter-bureau handover policy:</span> transferred cases retain full prior ownership history and require acknowledgment by the receiving Bureau Head.
            </div>
            <Tag tone="info">{transferredCases.length} pending handover</Tag>
          </div>

          <Card className="overflow-hidden">
            <Table>
              <thead>
                <tr>
                  <Th>Case reference / ID</Th>
                  <Th>Institution name</Th>
                  <Th>Transfer direction</Th>
                  <Th>Category</Th>
                  <Th>Last action / reason</Th>
                  <Th>Next required action</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {transferredCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted">No active transferred cases currently in queue.</td>
                  </tr>
                ) : (
                  transferredCases.map((c) => (
                    <Tr key={c.case_id}>
                      <Td>
                        <Link to={`/cases/${c.case_id}`} className="font-medium">{c.complaint_reference}</Link>
                        <div className="text-xs text-muted">{c.case_id}</div>
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
                        <div className="text-xs text-muted">{new Date(c.last_action_at).toLocaleDateString()}</div>
                      </Td>
                      <Td>{c.next_action || 'Pending'}</Td>
                      <Td className="text-right">
                        <Link to={`/cases/${c.case_id}`} className="hover:underline">Review case</Link>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-md border border-border bg-surface text-sm flex items-center justify-between gap-4">
            <div>
              <span className="font-medium">Escalation directive:</span> escalated cases bypass normal queues and require priority hearing or Member Secretary directives.
            </div>
            <Tag tone="danger">{escalatedCases.length} escalated cases</Tag>
          </div>

          <Card className="overflow-hidden">
            <Table>
              <thead>
                <tr>
                  <Th>Case reference / ID</Th>
                  <Th>Institution name</Th>
                  <Th>Bureau</Th>
                  <Th>Category</Th>
                  <Th>Escalation summary</Th>
                  <Th className="text-right">Days elapsed</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {escalatedCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted">No escalated cases in queue.</td>
                  </tr>
                ) : (
                  escalatedCases.map((c) => (
                    <Tr key={c.case_id}>
                      <Td>
                        <Link to={`/cases/${c.case_id}`} className="font-medium">{c.complaint_reference}</Link>
                        <div className="text-xs text-muted">{c.case_id}</div>
                      </Td>
                      <Td className="max-w-xs truncate font-medium">{c.institution_name}</Td>
                      <Td><Tag>{c.current_bureau_id.replace('BUR-', '')}</Tag></Td>
                      <Td className="text-muted">{c.category}</Td>
                      <Td className="max-w-xs">{c.last_action_summary}</Td>
                      <Td className="text-right tabular-nums">{c.days_pending}</Td>
                      <Td className="text-right">
                        <Link to={`/cases/${c.case_id}`} className="hover:underline">Urgent hearing</Link>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
};

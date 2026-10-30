import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ModelMetricsCard } from '../components/dashboard/ModelMetricsCard';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import { Card, CardHeader } from '../components/ui/Card';
import { Table, Th, Td, Tr } from '../components/ui/DataTable';

export const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState<any>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReportsSummary();
      setReportsData(data);
    } catch (e) {
      console.error('Failed to load reports summary', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await api.downloadExcelReport();
    } catch (err: any) {
      alert(err.response?.status === 403 ? 'Your role cannot export reports' : 'Export failed');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh] text-sm text-muted">Generating analytics and consolidated reports…</div>;
  }

  const { summary, disposal_rate_percentage, bureau_workload, region_distribution } = reportsData;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="AICTE Executive Reports and Analytics"
        description="Consolidated reporting with verified metrics and multi-sheet Excel exports."
        actions={<Button onClick={handleDownloadExcel}>Export master report (.xlsx)</Button>}
      />

      <ModelMetricsCard />

      <div className="p-3 rounded-sm bg-page border border-border text-sm">
        <span className="font-medium">Report verification note:</span> figures are compiled from the local prototype repository.
        Disposal rate = (disposed cases / total registered cases) × 100. The denominator reflects historical registered records in the database.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Disposal performance"
          value={`${disposal_rate_percentage}%`}
          helper={`${summary.disposed_cases} of ${summary.total_cases} total complaints resolved`}
        />
        <StatCard label="Overdue caseload" value={summary.overdue_cases} helper="Cases past statutory SLA deadline" />
        <StatCard label="Multi-bureau hotspots" value={summary.multi_bureau_institutions_count} helper="Colleges with split bureau investigations" />
        <StatCard label="Open overlap alerts" value={summary.unresolved_overlap_alerts} helper="Active coordination alerts awaiting closure" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Bureau-wise grievance and disposal performance" />
        <Table>
          <thead>
            <tr>
              <Th>Bureau / cell code</Th>
              <Th>Bureau description</Th>
              <Th className="text-right">Total volume</Th>
              <Th className="text-right">Under process</Th>
              <Th className="text-right">Disposed</Th>
              <Th className="text-right">Escalated</Th>
              <Th className="text-right">Overdue</Th>
              <Th className="text-right">Disposal rate</Th>
            </tr>
          </thead>
          <tbody>
            {bureau_workload.map((b: any) => {
              const rate = b.total_cases > 0 ? Math.round((b.disposed_cases / b.total_cases) * 100) : 0;
              return (
                <Tr key={b.bureau_id}>
                  <Td className="font-medium">{b.bureau_code}</Td>
                  <Td>{b.bureau_name}</Td>
                  <Td className="text-right tabular-nums">{b.total_cases}</Td>
                  <Td className="text-right tabular-nums">{b.under_process_cases}</Td>
                  <Td className="text-right tabular-nums">{b.disposed_cases}</Td>
                  <Td className="text-right tabular-nums">{b.escalated_cases}</Td>
                  <Td className="text-right tabular-nums">{b.overdue_cases}</Td>
                  <Td className="text-right tabular-nums font-medium">{rate}%</Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Regional distribution and compliance" actions={<span className="text-xs text-muted">Across 7 AICTE regional councils</span>} />
        <Table>
          <thead>
            <tr>
              <Th>Regional council</Th>
              <Th className="text-right">Colleges monitored</Th>
              <Th className="text-right">Cumulative complaints</Th>
              <Th className="text-right">Active complaints</Th>
              <Th className="text-right">Average complaints per college</Th>
            </tr>
          </thead>
          <tbody>
            {region_distribution.map((r: any) => {
              const avg = r.institutions_count > 0 ? (r.count / r.institutions_count).toFixed(1) : '0';
              return (
                <Tr key={r.region}>
                  <Td className="font-medium">{r.region} Region</Td>
                  <Td className="text-right tabular-nums">{r.institutions_count}</Td>
                  <Td className="text-right tabular-nums">{r.count}</Td>
                  <Td className="text-right tabular-nums">{r.active_cases}</Td>
                  <Td className="text-right tabular-nums font-medium">{avg}</Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Download, Info, ShieldAlert, Building2, TrendingUp, AlertTriangle, FileSpreadsheet } from 'lucide-react';
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
import { api } from '../services/api';
import { ModelMetricsCard } from '../components/dashboard/ModelMetricsCard';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import { Card, CardHeader } from '../components/ui/Card';
import { Table, THead, Th, Td, Tr } from '../components/ui/Table';
<<<<<<< HEAD
import Badge from '../components/ui/Badge';
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

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
<<<<<<< HEAD
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 gap-3">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Generating analytics and consolidated reports…</span>
      </div>
    );
=======
    return <div className="flex items-center justify-center min-h-[50vh] text-[13px] text-muted">Generating analytics and consolidated reports…</div>;
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
  }

  const { summary, disposal_rate_percentage, bureau_workload, region_distribution } = reportsData;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
<<<<<<< HEAD
        title="AICTE Executive Reports & Analytics"
        description="Statutory grievance governance metrics, disposal audits, and multi-sheet Excel exports."
        actions={
          <Button onClick={handleDownloadExcel} variant="cta">
            <Download className="w-4 h-4 mr-2" />
            Export master report (.xlsx)
          </Button>
        }
=======
        title="AICTE Executive Reports and Analytics"
        description="Consolidated reporting with verified metrics and multi-sheet Excel exports."
        actions={<Button onClick={handleDownloadExcel}>Export master report (.xlsx)</Button>}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      />

      <ModelMetricsCard />

<<<<<<< HEAD
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 text-sm text-blue-900 shadow-xs">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-blue-950">Statutory verification note:</span> Figures are aggregated from the live case governance database. 
          Disposal rate calculation: <span className="font-mono bg-blue-100/70 px-1.5 py-0.5 rounded text-blue-900 text-xs">(disposed cases / total registered cases) × 100</span>.
          Historical baseline reflects registered filings across all active councils.
        </div>
=======
      <div className="p-3 rounded-sm bg-page border border-line text-[13px]">
        <span className="font-medium">Report verification note:</span> figures are compiled from the local prototype repository.
        Disposal rate = (disposed cases / total registered cases) × 100. The denominator reflects historical registered records in the database.
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Disposal performance"
          value={`${disposal_rate_percentage}%`}
          helper={`${summary.disposed_cases} of ${summary.total_cases} total complaints resolved`}
<<<<<<< HEAD
          tone="ok"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard 
          label="Overdue caseload" 
          value={summary.overdue_cases} 
          helper="Cases past statutory SLA deadline" 
          tone="bad" 
          icon={<ShieldAlert className="w-5 h-5 text-rose-600" />}
        />
        <StatCard 
          label="Multi-bureau hotspots" 
          value={summary.multi_bureau_institutions_count} 
          helper="Colleges with cross-bureau investigations" 
          icon={<Building2 className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard 
          label="Open overlap alerts" 
          value={summary.unresolved_overlap_alerts} 
          helper="Active coordination alerts awaiting closure" 
          tone="warn" 
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader 
          title="Bureau-wise Grievance & Disposal Performance" 
          actions={<span className="text-xs text-slate-500 font-medium">Updated automatically on each lifecycle change</span>}
        />
        <Table>
          <THead>
            <tr>
              <Th>Bureau / Cell Code</Th>
              <Th>Bureau Description</Th>
              <Th align="right">Total Volume</Th>
              <Th align="right">Under Process</Th>
              <Th align="right">Disposed</Th>
              <Th align="right">Escalated</Th>
              <Th align="right">Overdue</Th>
              <Th align="right">Disposal Rate</Th>
=======
        />
        <StatCard label="Overdue caseload" value={summary.overdue_cases} helper="Cases past statutory SLA deadline" tone="bad" />
        <StatCard label="Multi-bureau hotspots" value={summary.multi_bureau_institutions_count} helper="Colleges with split bureau investigations" />
        <StatCard label="Open overlap alerts" value={summary.unresolved_overlap_alerts} helper="Active coordination alerts awaiting closure" tone="warn" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Bureau-wise grievance and disposal performance" />
        <Table>
          <THead>
            <tr>
              <Th>Bureau / cell code</Th>
              <Th>Bureau description</Th>
              <Th align="right">Total volume</Th>
              <Th align="right">Under process</Th>
              <Th align="right">Disposed</Th>
              <Th align="right">Escalated</Th>
              <Th align="right">Overdue</Th>
              <Th align="right">Disposal rate</Th>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            </tr>
          </THead>
          <tbody>
            {bureau_workload.map((b: any) => {
              const rate = b.total_cases > 0 ? Math.round((b.disposed_cases / b.total_cases) * 100) : 0;
              return (
                <Tr key={b.bureau_id}>
<<<<<<< HEAD
                  <Td>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                      {b.bureau_code}
                    </span>
                  </Td>
                  <Td className="font-medium text-slate-900">{b.bureau_name}</Td>
                  <Td align="right" className="tabular-nums font-semibold text-slate-900">{b.total_cases}</Td>
                  <Td align="right" className="tabular-nums text-slate-600">{b.under_process_cases}</Td>
                  <Td align="right" className="tabular-nums font-medium text-emerald-700">{b.disposed_cases}</Td>
                  <Td align="right" className="tabular-nums text-amber-700 font-medium">{b.escalated_cases}</Td>
                  <Td align="right" className="tabular-nums text-rose-700 font-semibold">{b.overdue_cases}</Td>
                  <Td align="right" className="tabular-nums">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className={`h-full rounded-full ${rate >= 70 ? 'bg-emerald-500' : rate >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                          style={{ width: `${Math.min(100, rate)}%` }} 
                        />
                      </div>
                      <span className={`font-semibold ${rate >= 70 ? 'text-emerald-700' : rate >= 40 ? 'text-amber-700' : 'text-rose-700'}`}>
                        {rate}%
                      </span>
                    </div>
                  </Td>
=======
                  <Td className="font-medium">{b.bureau_code}</Td>
                  <Td>{b.bureau_name}</Td>
                  <Td align="right" className="tabular-nums">{b.total_cases}</Td>
                  <Td align="right" className="tabular-nums">{b.under_process_cases}</Td>
                  <Td align="right" className="tabular-nums">{b.disposed_cases}</Td>
                  <Td align="right" className="tabular-nums">{b.escalated_cases}</Td>
                  <Td align="right" className="tabular-nums">{b.overdue_cases}</Td>
                  <Td align="right" className="tabular-nums font-medium">{rate}%</Td>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <Card className="overflow-hidden">
<<<<<<< HEAD
        <CardHeader 
          title="Regional Distribution & Compliance Monitor" 
          actions={<span className="text-xs text-slate-500 font-medium">Across 7 AICTE Regional Councils</span>} 
        />
        <Table>
          <THead>
            <tr>
              <Th>Regional Council</Th>
              <Th align="right">Colleges Monitored</Th>
              <Th align="right">Cumulative Complaints</Th>
              <Th align="right">Active Caseload</Th>
              <Th align="right">Avg per College</Th>
=======
        <CardHeader title="Regional distribution and compliance" actions={<span className="text-[12px] text-muted">Across 7 AICTE regional councils</span>} />
        <Table>
          <THead>
            <tr>
              <Th>Regional council</Th>
              <Th align="right">Colleges monitored</Th>
              <Th align="right">Cumulative complaints</Th>
              <Th align="right">Active complaints</Th>
              <Th align="right">Average complaints per college</Th>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            </tr>
          </THead>
          <tbody>
            {region_distribution.map((r: any) => {
              const avg = r.institutions_count > 0 ? (r.count / r.institutions_count).toFixed(1) : '0';
              return (
                <Tr key={r.region}>
<<<<<<< HEAD
                  <Td className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                    {r.region} Region
                  </Td>
                  <Td align="right" className="tabular-nums text-slate-700">{r.institutions_count}</Td>
                  <Td align="right" className="tabular-nums font-semibold text-slate-900">{r.count}</Td>
                  <Td align="right" className="tabular-nums font-medium text-amber-700">{r.active_cases}</Td>
                  <Td align="right" className="tabular-nums font-semibold text-slate-900">{avg}</Td>
=======
                  <Td className="font-medium">{r.region} Region</Td>
                  <Td align="right" className="tabular-nums">{r.institutions_count}</Td>
                  <Td align="right" className="tabular-nums">{r.count}</Td>
                  <Td align="right" className="tabular-nums">{r.active_cases}</Td>
                  <Td align="right" className="tabular-nums font-medium">{avg}</Td>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

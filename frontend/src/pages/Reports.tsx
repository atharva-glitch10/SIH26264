import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';

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

  const handleDownloadExcel = () => {
    const url = api.getExportUrl();
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Clock className="w-8 h-8 animate-spin text-teal-600 mb-2" />
        <span className="text-sm font-medium">Generating Analytics & Consolidated Reports...</span>
      </div>
    );
  }

  const { summary, disposal_rate_percentage, bureau_workload, region_distribution, ageing_analysis } = reportsData;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AICTE Executive Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official consolidated reporting suite with verified metrics and genuine multi-sheet Excel spreadsheet exports.
          </p>
        </div>

        <button
          onClick={handleDownloadExcel}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Master Report (.xlsx)
        </button>
      </div>

      {/* Synthetic Data Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-start gap-3">
        <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Report Verification Disclaimer:</strong> Figures compiled from local SQLite prototype repository.
          Formula for disposal rate: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">Disposal Rate = (Disposed Cases / Total Registered Cases) * 100</code>.
          Denominator reflects historical registered records in the database.
        </div>
      </div>

      {/* Primary KPI Performance Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Disposal Performance</span>
          <div className="text-3xl font-extrabold text-teal-700 mt-2">{disposal_rate_percentage}%</div>
          <span className="text-xs text-slate-500 mt-1 block">
            {summary.disposed_cases} of {summary.total_cases} total complaints resolved
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Overdue Caseload</span>
          <div className="text-3xl font-extrabold text-rose-600 mt-2">{summary.overdue_cases}</div>
          <span className="text-xs text-rose-600 mt-1 block font-medium">Cases past statutory SLA deadline</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Multi-Bureau Hotspots</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{summary.multi_bureau_institutions_count}</div>
          <span className="text-xs text-slate-500 mt-1 block">Colleges with split bureau investigations</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Open Overlap Alerts</span>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">{summary.unresolved_overlap_alerts}</div>
          <span className="text-xs text-slate-500 mt-1 block">Active coordination alerts awaiting closure</span>
        </div>
      </div>

      {/* Bureau Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Bureau-Wise Grievance & Disposal Performance</h3>
          <span className="text-xs text-slate-500">Official Bureau Breakdown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Bureau / Cell Code</th>
                <th className="py-3 px-4">Bureau Description</th>
                <th className="py-3 px-4 text-center">Total Volume</th>
                <th className="py-3 px-4 text-center">Under Process</th>
                <th className="py-3 px-4 text-center">Disposed</th>
                <th className="py-3 px-4 text-center">Escalated</th>
                <th className="py-3 px-4 text-center">Overdue</th>
                <th className="py-3 px-4 text-right">Disposal Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bureau_workload.map((b: any) => {
                const rate = b.total_cases > 0 ? Math.round((b.disposed_cases / b.total_cases) * 100) : 0;
                return (
                  <tr key={b.bureau_id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.bureau_code}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{b.bureau_name}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{b.total_cases}</td>
                    <td className="py-3 px-4 text-center text-teal-700 font-semibold">{b.under_process_cases}</td>
                    <td className="py-3 px-4 text-center text-emerald-700 font-semibold">{b.disposed_cases}</td>
                    <td className="py-3 px-4 text-center text-rose-700 font-semibold">{b.escalated_cases}</td>
                    <td className="py-3 px-4 text-center text-rose-600 font-bold">{b.overdue_cases}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-bold text-slate-900">{rate}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regional Caseload Distribution */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Regional Distribution & Compliance</h3>
          <span className="text-xs text-slate-500">Across 7 AICTE Regional Councils</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Regional Council</th>
                <th className="py-3 px-4 text-center">Colleges Monitored</th>
                <th className="py-3 px-4 text-center">Cumulative Complaints</th>
                <th className="py-3 px-4 text-center">Active Complaints</th>
                <th className="py-3 px-4 text-right">Average Complaints per College</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {region_distribution.map((r: any) => {
                const avg = r.institutions_count > 0 ? (r.count / r.institutions_count).toFixed(1) : '0';
                return (
                  <tr key={r.region} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900">{r.region} Region</td>
                    <td className="py-3 px-4 text-center text-slate-700 font-medium">{r.institutions_count}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">{r.count}</td>
                    <td className="py-3 px-4 text-center text-teal-700 font-semibold">{r.active_cases}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-800 font-bold">{avg}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

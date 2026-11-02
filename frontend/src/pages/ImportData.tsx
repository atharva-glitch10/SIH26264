import React, { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, ArrowRight, History } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ImportBatch, ImportResult, ImportRowResult } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Tag, { TagTone } from '../components/ui/Tag';
import EmptyState from '../components/ui/EmptyState';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, THead, Th, Td, Tr } from '../components/ui/Table';

const labelClass = 'block text-xs font-semibold text-slate-700 mb-1.5';
const selectClass =
  'h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 shadow-xs cursor-pointer';

const BUREAUS = [
  { id: 'BUR-PGRC', label: 'PGRC – Public Grievance Redressal Cell' },
  { id: 'BUR-RB', label: 'RB – Regulation Bureau' },
  { id: 'BUR-APP', label: 'Approval Bureau' },
  { id: 'BUR-VIG', label: 'Vigilance Cell' },
];

const statusTag = (s: string): TagTone =>
  s.startsWith('CREATED') || s.startsWith('WOULD_CREATE')
    ? s.endsWith('REVIEW')
      ? 'warn'
      : 'ok'
    : s === 'REJECTED'
    ? 'bad'
    : 'neutral';

export const ImportData: React.FC = () => {
  const { user, can } = useAuth();
  const { refreshSummary } = useOutletContext<{ refreshSummary: () => void }>();
  const canImportAny = can('import:any');
  const canImport = canImportAny || can('import:own_bureau');
  const [bureau, setBureau] = useState<string>(user?.bureau_id || '');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<ImportBatch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadHistory = () => api.getImportBatches().then(setHistory).catch(() => setHistory([]));
  useEffect(() => {
    loadHistory();
  }, []);

  const run = async (dryRun: boolean) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const res = await api.uploadImport(file, { source_bureau_id: bureau || undefined, dry_run: dryRun });
      setResult(res);
      if (!dryRun) {
        loadHistory();
        refreshSummary();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Bulk Complaint Ingestion Gateway"
        description="Ingest external bureau registers (CSV / Excel). Automated entity resolution links institutions, classifies grievances, detects duplicates across all bureaus, and flags cross-bureau overlaps."
      />

      {!canImport && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 text-xs text-amber-800 font-medium">
          Your role is read-only. Ask an authorized Bureau Officer or Senior Management to ingest records.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardBody className="space-y-5">
            {/* File Dropzone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  setFile(e.dataTransfer.files[0]);
                  setResult(null);
                }
              }}
              className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-10 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 mx-auto transition-colors shadow-2xs mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {file ? file.name : 'Drop a .csv or .xlsx file here, or browse files'}
              </div>
              <div className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Automatic flexible header mapping ("Name of Institution", "Complaint Details", "Permanent ID"…). Max 5,000 records per batch.
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setResult(null);
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-end pt-2">
              <label className="flex-1">
                <span className={labelClass}>Default Bureau Destination</span>
                <select
                  value={bureau}
                  onChange={(e) => setBureau(e.target.value)}
                  disabled={!canImportAny}
                  className={`${selectClass} w-full`}
                >
                  {canImportAny && <option value="">Auto-detect from bureau column in file</option>}
                  {BUREAUS.filter((b) => canImportAny || b.id === user?.bureau_id).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                variant="secondary"
                disabled={!file || busy || !canImport}
                onClick={() => run(true)}
                className="bg-white"
              >
                Validate (dry run)
              </Button>
              <Button
                disabled={!file || busy || !canImport}
                onClick={() => run(false)}
                className="bg-slate-900 text-white"
              >
                {busy ? 'Processing batch…' : 'Execute Import'}
              </Button>
            </div>
            {error && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-lg p-3 font-medium">
                {error}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Import History Card */}
        <Card>
          <CardHeader title="Recent Ingestion Batches" description="Audit log of batch imports" />
          <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No previous import batches recorded.</div>
            ) : (
              history.map((h) => (
                <div key={h.import_id} className="p-3.5 text-xs space-y-1 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 truncate max-w-[160px]">{h.file_name || 'Import batch'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {h.record_count} rows
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {new Date(h.imported_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Import Result Feedback */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total rows in batch" value={result.total_rows} />
            <StatCard label="Ready to create" value={result.created} tone="ok" />
            <StatCard label="Sent to review queue" value={result.needs_review} tone="warn" />
            <StatCard label="Rejected errors" value={result.rejected} tone={result.rejected > 0 ? 'bad' : 'default'} />
          </div>

          <Card className="overflow-hidden">
            <CardHeader
              title={`Batch Row-by-Row Analysis (${result.rows.length} records)`}
              description={result.dry_run ? 'Dry-run validation results (no records committed)' : 'Committed batch outcomes'}
            />
            <Table>
              <THead>
                <tr>
                  <Th>Row #</Th>
                  <Th>Extracted Institution</Th>
                  <Th>Classification Outcome</Th>
                  <Th>Grievance Snippet</Th>
                </tr>
              </THead>
              <tbody>
                {result.rows.map((r: ImportRowResult) => (
                  <Tr key={r.row}>
                    <Td className="font-mono text-xs">{r.row}</Td>
                    <Td>
                      <div className="font-medium text-slate-900">{r.institution || 'N/A'}</div>
                      {r.match_status && (
                        <div className="text-[11px] text-slate-400">Match: {r.match_status}</div>
                      )}
                    </Td>
                    <Td>
                      <Tag tone={statusTag(r.status)}>{r.status.replace(/_/g, ' ')}</Tag>
                    </Td>
                    <Td className="max-w-md">
                      <p className="text-xs text-slate-600 truncate">{r.message || r.category || '—'}</p>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ImportData;

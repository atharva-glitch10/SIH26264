import React, { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
<<<<<<< HEAD
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, ArrowRight, History } from 'lucide-react';
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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

<<<<<<< HEAD
const labelClass = 'block text-xs font-semibold text-slate-700 mb-1.5';
const selectClass =
  'h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 shadow-xs cursor-pointer';
=======
const labelClass = 'block text-[12px] font-medium text-ink mb-1';
const selectClass = 'h-9 px-2.5 text-[13px] bg-white border border-line rounded-sm text-ink';
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

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
<<<<<<< HEAD
        title="Bulk Complaint Ingestion Gateway"
        description="Ingest external bureau registers (CSV / Excel). Automated entity resolution links institutions, classifies grievances, detects duplicates across all bureaus, and flags cross-bureau overlaps."
      />

      {!canImport && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 text-xs text-amber-800 font-medium">
          Your role is read-only. Ask an authorized Bureau Officer or Senior Management to ingest records.
=======
        title="Bulk Complaint Import"
        description="Bring a bureau's existing complaint register (CSV or Excel) into the central dashboard. Every row is linked to an institution, categorised, checked for duplicates across all bureaus and scanned for cross-bureau overlaps."
      />

      {!canImport && (
        <div className="p-3 rounded-sm bg-warn/5 border border-warn/30 text-[13px]">
          Your role is read-only. Ask a bureau officer or senior management to import data.
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
<<<<<<< HEAD
          <CardBody className="space-y-5">
            {/* File Dropzone */}
=======
          <CardBody className="space-y-4">
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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
<<<<<<< HEAD
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
=======
              className="border border-dashed border-line hover:border-brand rounded-md p-8 text-center cursor-pointer bg-page"
            >
              <div className="text-[13px] font-medium">
                {file ? file.name : 'Drop a .csv or .xlsx file here, or click to choose'}
              </div>
              <div className="text-[12px] text-muted mt-1">
                Headers are matched flexibly ("Name of Institution", "Complaint Details", "Permanent ID"…). Max 5,000 rows.
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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

<<<<<<< HEAD
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end pt-2">
              <label className="flex-1">
                <span className={labelClass}>Default Bureau Destination</span>
=======
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <label className="flex-1">
                <span className={labelClass}>Default bureau (used when a row has no bureau column)</span>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                <select
                  value={bureau}
                  onChange={(e) => setBureau(e.target.value)}
                  disabled={!canImportAny}
                  className={`${selectClass} w-full`}
                >
<<<<<<< HEAD
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
=======
                  {canImportAny && <option value="">Use the bureau column in the file</option>}
                  {BUREAUS.filter((b) => canImportAny || b.id === user?.bureau_id).map((b) => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </label>
              <Button variant="secondary" disabled={!file || busy || !canImport} onClick={() => run(true)}>
                Validate (dry run)
              </Button>
              <Button disabled={!file || busy || !canImport} onClick={() => run(false)}>
                {busy ? 'Processing…' : 'Import'}
              </Button>
            </div>
            {error && <div className="text-[13px] text-bad bg-bad/5 border border-bad/30 rounded-sm p-2">{error}</div>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="What happens to each row" />
          <CardBody className="space-y-3 text-[13px]">
            <ol className="list-decimal pl-4 space-y-1.5">
              <li><strong>Link</strong> to the institution by Permanent ID, name, alias or fuzzy match. Unclear names go to the Data Quality review queue instead of being merged silently.</li>
              <li><strong>Categorise</strong> the complaint when the category column is empty, with a confidence score.</li>
              <li><strong>Check for duplicates</strong> against the institution's complaints in every bureau.</li>
              <li><strong>Raise overlap alerts</strong> when bureaus are now handling the same college.</li>
              <li>Re-uploading the same file is safe: rows with a complaint number already imported are skipped.</li>
            </ol>
            <button onClick={() => api.downloadImportTemplate()} className="text-brand hover:underline">
              Download CSV template
            </button>
            <div className="text-[12px] text-muted">
              Sample files to try: <span className="font-mono">data/sample_imports/</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {result && (
        <Card>
          <CardHeader
            title={`${result.dry_run ? 'Validation preview (nothing saved)' : `Import complete · ${result.import_id}`} — ${result.file_name}`}
            actions={
              !result.dry_run && result.new_overlap_alerts > 0 && (
                <Link to="/overlaps" className="text-[13px] text-brand hover:underline">
                  {result.new_overlap_alerts} new overlap alert(s)
                </Link>
              )
            }
          />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <StatCard label={result.dry_run ? 'Would create' : 'Created'} value={result.created} />
              <StatCard label="Institution needs review" value={result.needs_review} tone={result.needs_review > 0 ? 'warn' : 'default'} />
              <StatCard label="Auto-categorised" value={result.auto_categorized} />
              <StatCard label="Possible duplicates" value={result.duplicates_flagged} />
              <StatCard label="Rejected" value={result.rejected} tone={result.rejected > 0 ? 'bad' : 'default'} />
              <StatCard label="Already imported" value={result.skipped_already_imported} />
            </div>
            <Table>
              <THead>
                <tr>
                  <Th align="right">Row</Th>
                  <Th>Status</Th>
                  <Th>Case</Th>
                  <Th>Institution (match)</Th>
                  <Th>Category</Th>
                  <Th>Duplicate of</Th>
                  <Th>Message</Th>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                </tr>
              </THead>
              <tbody>
                {result.rows.map((r: ImportRowResult) => (
<<<<<<< HEAD
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
=======
                  <Tr key={r.row} className="align-top">
                    <Td align="right" className="text-muted tabular-nums">{r.row}</Td>
                    <Td><Tag tone={statusTag(r.status)}>{r.status.replace(/_/g, ' ')}</Tag></Td>
                    <Td>
                      {r.case_id ? <Link to={`/cases/${r.case_id}`} className="text-brand hover:underline">{r.case_id}</Link> : r.external_reference || '—'}
                    </Td>
                    <Td>
                      {r.institution ? (
                        <>
                          <div>{r.institution}</div>
                          <div className="text-[12px] text-muted">{r.match_status?.replace(/_/g, ' ')} · {Math.round(r.match_score || 0)}%</div>
                        </>
                      ) : '—'}
                    </Td>
                    <Td>
                      {r.category ? (
                        <>
                          <div>{r.category}</div>
                          {r.category_source === 'AUTO' && (
                            <div className="text-[12px] text-muted">suggested · {Math.round((r.category_confidence || 0) * 100)}% confidence</div>
                          )}
                        </>
                      ) : '—'}
                    </Td>
                    <Td>
                      {r.duplicate_of ? <Link to={`/cases/${r.duplicate_of}`} className="text-brand hover:underline">{r.duplicate_of}</Link> : '—'}
                    </Td>
                    <Td className="text-muted">{r.message || ''}</Td>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                  </Tr>
                ))}
              </tbody>
            </Table>
<<<<<<< HEAD
          </Card>
        </div>
      )}
    </div>
  );
};

export default ImportData;
=======
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Recent imports" />
        {history.length === 0 ? (
          <EmptyState title="No files imported yet." />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Batch</Th>
                <Th>File</Th>
                <Th>By</Th>
                <Th>When</Th>
                <Th align="right">Rows</Th>
                <Th align="right">Imported</Th>
                <Th align="right">Review</Th>
                <Th align="right">Duplicates</Th>
                <Th align="right">Rejected</Th>
              </tr>
            </THead>
            <tbody>
              {history.map((b) => (
                <Tr key={b.import_id}>
                  <Td>{b.import_id}</Td>
                  <Td>{b.file_name || '—'}</Td>
                  <Td>{b.created_by || '—'}</Td>
                  <Td>{new Date(b.imported_at).toLocaleString()}</Td>
                  <Td align="right" className="tabular-nums">{b.record_count}</Td>
                  <Td align="right" className="tabular-nums">{b.valid_count}</Td>
                  <Td align="right" className="tabular-nums">{b.needs_review_count ?? 0}</Td>
                  <Td align="right" className="tabular-nums">{b.duplicate_count ?? 0}</Td>
                  <Td align="right" className="tabular-nums">{b.rejected_count}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

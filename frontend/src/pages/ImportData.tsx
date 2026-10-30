import React, { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ImportBatch, ImportResult, ImportRowResult } from '../types';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Tag, { TagTone } from '../components/ui/Tag';
import EmptyState from '../components/ui/EmptyState';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, Th, Td, Tr } from '../components/ui/DataTable';
import { labelClass, selectClass } from '../components/ui/styles';

const BUREAUS = [
  { id: 'BUR-PGRC', label: 'PGRC – Public Grievance Redressal Cell' },
  { id: 'BUR-RB', label: 'RB – Regulation Bureau' },
  { id: 'BUR-APP', label: 'Approval Bureau' },
  { id: 'BUR-VIG', label: 'Vigilance Cell' },
];

const statusTag = (s: string): TagTone =>
  s.startsWith('CREATED') || s.startsWith('WOULD_CREATE')
    ? s.endsWith('REVIEW')
      ? 'warning'
      : 'success'
    : s === 'REJECTED'
    ? 'danger'
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
        title="Bulk Complaint Import"
        description="Bring a bureau's existing complaint register (CSV or Excel) into the central dashboard. Every row is linked to an institution, categorised, checked for duplicates across all bureaus and scanned for cross-bureau overlaps."
      />

      {!canImport && (
        <div className="p-3 rounded-sm bg-warning/10 border border-warning/30 text-sm">
          Your role is read-only. Ask a bureau officer or senior management to import data.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardBody className="space-y-4">
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
              className="border border-dashed border-border hover:border-brand rounded-md p-8 text-center cursor-pointer bg-page"
            >
              <div className="text-sm font-medium">
                {file ? file.name : 'Drop a .csv or .xlsx file here, or click to choose'}
              </div>
              <div className="text-xs text-muted mt-1">
                Headers are matched flexibly ("Name of Institution", "Complaint Details", "Permanent ID"…). Max 5,000 rows.
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

            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <label className="flex-1">
                <span className={labelClass}>Default bureau (used when a row has no bureau column)</span>
                <select
                  value={bureau}
                  onChange={(e) => setBureau(e.target.value)}
                  disabled={!canImportAny}
                  className={`${selectClass} w-full`}
                >
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
            {error && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-sm p-2">{error}</div>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="What happens to each row" />
          <CardBody className="space-y-3 text-sm">
            <ol className="list-decimal pl-4 space-y-1.5">
              <li><strong>Link</strong> to the institution by Permanent ID, name, alias or fuzzy match. Unclear names go to the Data Quality review queue instead of being merged silently.</li>
              <li><strong>Categorise</strong> the complaint when the category column is empty, with a confidence score.</li>
              <li><strong>Check for duplicates</strong> against the institution's complaints in every bureau.</li>
              <li><strong>Raise overlap alerts</strong> when bureaus are now handling the same college.</li>
              <li>Re-uploading the same file is safe: rows with a complaint number already imported are skipped.</li>
            </ol>
            <button onClick={() => api.downloadImportTemplate()} className="text-brand-accent hover:underline">
              Download CSV template
            </button>
            <div className="text-xs text-muted">
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
                <Link to="/overlaps" className="text-sm hover:underline">
                  {result.new_overlap_alerts} new overlap alert(s)
                </Link>
              )
            }
          />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <StatCard label={result.dry_run ? 'Would create' : 'Created'} value={result.created} />
              <StatCard label="Institution needs review" value={result.needs_review} />
              <StatCard label="Auto-categorised" value={result.auto_categorized} />
              <StatCard label="Possible duplicates" value={result.duplicates_flagged} />
              <StatCard label="Rejected" value={result.rejected} />
              <StatCard label="Already imported" value={result.skipped_already_imported} />
            </div>
            <Table>
              <thead>
                <tr>
                  <Th>Row</Th>
                  <Th>Status</Th>
                  <Th>Case</Th>
                  <Th>Institution (match)</Th>
                  <Th>Category</Th>
                  <Th>Duplicate of</Th>
                  <Th>Message</Th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r: ImportRowResult) => (
                  <Tr key={r.row} className="align-top">
                    <Td className="text-muted tabular-nums">{r.row}</Td>
                    <Td><Tag tone={statusTag(r.status)}>{r.status.replace(/_/g, ' ')}</Tag></Td>
                    <Td>
                      {r.case_id ? <Link to={`/cases/${r.case_id}`}>{r.case_id}</Link> : r.external_reference || '—'}
                    </Td>
                    <Td>
                      {r.institution ? (
                        <>
                          <div>{r.institution}</div>
                          <div className="text-xs text-muted">{r.match_status?.replace(/_/g, ' ')} · {Math.round(r.match_score || 0)}%</div>
                        </>
                      ) : '—'}
                    </Td>
                    <Td>
                      {r.category ? (
                        <>
                          <div>{r.category}</div>
                          {r.category_source === 'AUTO' && (
                            <div className="text-xs text-muted">suggested · {Math.round((r.category_confidence || 0) * 100)}% confidence</div>
                          )}
                        </>
                      ) : '—'}
                    </Td>
                    <Td>
                      {r.duplicate_of ? <Link to={`/cases/${r.duplicate_of}`}>{r.duplicate_of}</Link> : '—'}
                    </Td>
                    <Td className="text-muted">{r.message || ''}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Recent imports" />
        {history.length === 0 ? (
          <EmptyState title="No files imported yet." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Batch</Th>
                <Th>File</Th>
                <Th>By</Th>
                <Th>When</Th>
                <Th className="text-right">Rows</Th>
                <Th className="text-right">Imported</Th>
                <Th className="text-right">Review</Th>
                <Th className="text-right">Duplicates</Th>
                <Th className="text-right">Rejected</Th>
              </tr>
            </thead>
            <tbody>
              {history.map((b) => (
                <Tr key={b.import_id}>
                  <Td>{b.import_id}</Td>
                  <Td>{b.file_name || '—'}</Td>
                  <Td>{b.created_by || '—'}</Td>
                  <Td>{new Date(b.imported_at).toLocaleString()}</Td>
                  <Td className="text-right tabular-nums">{b.record_count}</Td>
                  <Td className="text-right tabular-nums">{b.valid_count}</Td>
                  <Td className="text-right tabular-nums">{b.needs_review_count ?? 0}</Td>
                  <Td className="text-right tabular-nums">{b.duplicate_count ?? 0}</Td>
                  <Td className="text-right tabular-nums">{b.rejected_count}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { IntakePayload, IntakePreview, IntakeResult } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Card } from '../ui/Card';

const CATEGORIES = [
  'Academic and Examination',
  'Infrastructure and Facilities',
  'Faculty and Staffing',
  'Regulatory Compliance',
  'Admission Grievances',
  'Fee Related Grievances',
  'General Institutional',
];

const BUREAUS = [
  { id: 'BUR-RB', label: 'Regulation Bureau (RB)' },
  { id: 'BUR-PGRC', label: 'Public Grievance Cell (PGRC)' },
  { id: 'BUR-APP', label: 'Approval Bureau' },
  { id: 'BUR-VIG', label: 'Vigilance Cell' },
];

const pct = (v?: number | null) => `${Math.round((v || 0) * 100)}%`;

const FORM_ID = 'smart-intake-form';

interface Props {
  onClose: () => void;
  onRegistered: () => void;
}

export const SmartIntakeModal: React.FC<Props> = ({ onClose, onRegistered }) => {
  const { user, can } = useAuth();
  const registerAny = can('case:register:any');
  const [form, setForm] = useState<IntakePayload>({
    institution_name: '',
    aicte_permanent_id: '',
    source_bureau_id: registerAny ? 'BUR-PGRC' : user?.bureau_id || 'BUR-PGRC',
    description: '',
    category: '',
    priority: '',
    complainant_name: '',
    complainant_contact: '',
    external_reference: '',
  });
  const [preview, setPreview] = useState<IntakePreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof IntakePayload, value: string) => setForm((f) => ({ ...f, [key]: value }));

  // Debounced live preview: institution match, category suggestion, priority hint, possible duplicates
  useEffect(() => {
    const hasInst = (form.institution_name || '').trim().length >= 3 || (form.aicte_permanent_id || '').trim().length >= 3;
    if (!hasInst && (form.description || '').trim().length < 10) {
      setPreview(null);
      return;
    }
    const t = setTimeout(async () => {
      setPreviewing(true);
      try {
        const p = await api.previewIntake({
          institution_name: form.institution_name || undefined,
          aicte_permanent_id: form.aicte_permanent_id || undefined,
          description: form.description,
          category: form.category || undefined,
          complainant_name: form.complainant_name || undefined,
          complainant_contact: form.complainant_contact || undefined,
        });
        setPreview(p);
      } catch {
        setPreview(null);
      } finally {
        setPreviewing(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [form.institution_name, form.aicte_permanent_id, form.description, form.category, form.complainant_name, form.complainant_contact]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const clean: IntakePayload = { source_bureau_id: form.source_bureau_id, description: form.description.trim() };
      (['institution_name', 'aicte_permanent_id', 'category', 'priority', 'complainant_name', 'complainant_contact', 'external_reference'] as const)
        .forEach((k) => {
          const v = (form[k] || '').trim();
          if (v) (clean as any)[k] = v;
        });
      const res = await api.createCase(clean);
      setResult(res);
      onRegistered();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map((d: any) => d.msg).join('; ') : detail || 'Failed to register complaint');
    } finally {
      setBusy(false);
    }
  };

  const input = 'w-full h-9 px-3 text-[13px] bg-white border border-line rounded-sm text-ink placeholder:text-muted';
  const area = 'w-full px-3 py-2 text-[13px] bg-white border border-line rounded-sm text-ink placeholder:text-muted';
  const label = 'block text-[12px] font-medium text-ink mb-1';
  const panelTitle = 'text-[12px] text-muted';

  const footer = result ? (
    <>
      <Button variant="ghost" onClick={onClose}>Close</Button>
      <Link
        to={`/cases/${result.case_id}`}
        className="inline-flex items-center justify-center h-9 px-4 text-[13px] font-medium rounded-sm bg-brand text-white hover:bg-brand-hover"
      >
        Open case
      </Link>
    </>
  ) : (
    <>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button type="submit" form={FORM_ID} disabled={busy}>
        {busy ? 'Registering…' : 'Register complaint'}
      </Button>
    </>
  );

  return (
    <Modal open onClose={onClose} title="Register complaint" width="lg" flush footer={footer}>
      {result ? (
        <div className="p-4 space-y-4">
          <div className="p-3 rounded-sm bg-ok/5 border border-ok/30 text-[13px] text-ok">
            Registered{' '}
            <Link to={`/cases/${result.case_id}`} className="font-mono font-semibold underline">{result.complaint_reference}</Link>
            {' '}· SLA due {new Date(result.expected_disposal_at).toLocaleDateString()}
          </div>
          <ul className="text-[13px] text-ink space-y-2">
            <li>Linked to <strong>{result.institution.canonical_name}</strong> ({result.institution.match_status.replace(/_/g, ' ').toLowerCase()}, {Math.round(result.institution.score)}%)</li>
            <li>Category <strong>{result.category.value}</strong>{result.category.source === 'AUTO' && ` (suggested, ${pct(result.category.confidence)} confidence)`} · Priority <strong>{result.priority.value}</strong>{result.priority.source === 'AUTO' && ` (${result.priority.reason})`}</li>
            {result.duplicate && (
              <li className="text-warn">Possible duplicate of <Link className="underline font-mono" to={`/cases/${result.duplicate.case_id}`}>{result.duplicate.case_id}</Link> in {result.duplicate.bureau_id} ({Math.round(result.duplicate.score)}%)</li>
            )}
            {result.overlap_alert_id && (
              <li className="text-warn">Cross-bureau overlap alert {result.overlap_alert_id} is open for this institution</li>
            )}
          </ul>
        </div>
      ) : (
        <form id={FORM_ID} onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5">
          <div className="md:col-span-3 p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={label}>Institution name (as written in complaint)</label>
                <input value={form.institution_name} onChange={(e) => set('institution_name', e.target.value)} placeholder="e.g. Aryabhata Instt of Tech, Kanpur" className={input} />
              </div>
              <div>
                <label className={label}>or AICTE permanent ID</label>
                <input value={form.aicte_permanent_id} onChange={(e) => set('aicte_permanent_id', e.target.value)} placeholder="1-4329811" className={`${input} font-mono`} />
              </div>
            </div>
            <div>
              <label className={label}>Complaint text *</label>
              <textarea required minLength={10} rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Paste or type the complaint as received…" className={area} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={label}>Receiving bureau</label>
                <select value={form.source_bureau_id} onChange={(e) => set('source_bureau_id', e.target.value)} disabled={!registerAny} className={input}>
                  {BUREAUS.filter((b) => registerAny || b.id === user?.bureau_id).map((b) => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Category</label>
                <select value={form.category} onChange={(e) => set('category', e.target.value)} className={input}>
                  <option value="">Suggest automatically</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Priority</label>
                <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className={input}>
                  <option value="">Suggest automatically</option>
                  <option value="URGENT">Urgent (15 days)</option>
                  <option value="HIGH">High (30 days)</option>
                  <option value="MEDIUM">Medium (45 days)</option>
                  <option value="LOW">Low (60 days)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={label}>Complainant</label>
                <input value={form.complainant_name} onChange={(e) => set('complainant_name', e.target.value)} className={input} />
              </div>
              <div>
                <label className={label}>Email / phone</label>
                <input value={form.complainant_contact} onChange={(e) => set('complainant_contact', e.target.value)} className={input} />
              </div>
              <div>
                <label className={label}>Source ref. no.</label>
                <input value={form.external_reference} onChange={(e) => set('external_reference', e.target.value)} placeholder="e.g. CPGRAMS no." className={input} />
              </div>
            </div>
            {error && <div className="text-[13px] text-bad bg-bad/5 border border-bad/30 rounded-sm p-2">{error}</div>}
          </div>

          <aside className="md:col-span-2 bg-page border-l border-line p-4 space-y-3 text-[13px]">
            <div className="font-semibold text-ink">
              System suggestions {previewing && <span className="text-muted font-normal">· checking…</span>}
            </div>
            {!preview && <div className="text-muted">Start typing the institution and complaint to see the suggested link, category, priority and duplicate check.</div>}
            {preview && (
              <>
                <Card className="p-3">
                  <div className={panelTitle}>Institution</div>
                  {preview.institution ? (
                    <>
                      <div className="font-medium text-ink mt-0.5">{preview.institution.canonical_name}</div>
                      <div className={preview.institution.match_status === 'PENDING_REVIEW' ? 'text-warn' : 'text-ok'}>
                        {preview.institution.match_status === 'PENDING_REVIEW' ? 'Needs officer confirmation' : 'Confident match'} · {Math.round(preview.institution.score)}%
                      </div>
                      <div className="text-[12px] text-muted mt-0.5">{preview.institution.details}</div>
                    </>
                  ) : (
                    <div className="text-bad mt-0.5">{preview.institution_error || 'Not identified yet'}</div>
                  )}
                </Card>
                {preview.category && (
                  <Card className="p-3">
                    <div className={panelTitle}>Category</div>
                    {preview.category.source === 'AUTO' ? (
                      <>
                        <div className="font-medium text-ink mt-0.5">{preview.category.value} <span className="text-muted font-normal">· Suggested {pct(preview.category.confidence)}</span></div>
                        {preview.category.evidence.length > 0 && <div className="text-[12px] text-muted">because of: {preview.category.evidence.join(', ')}</div>}
                        {preview.category.alternatives[0] && <div className="text-[12px] text-muted">next best: {preview.category.alternatives[0].category} ({pct(preview.category.alternatives[0].confidence)})</div>}
                      </>
                    ) : (
                      <div className="text-ink mt-0.5">Officer selected · suggested {preview.category.suggested} ({pct(preview.category.suggested_confidence)})</div>
                    )}
                  </Card>
                )}
                {preview.priority && (
                  <Card className="p-3">
                    <div className={panelTitle}>Suggested priority</div>
                    <div className="font-medium text-ink mt-0.5">{preview.priority.priority}</div>
                    <div className="text-[12px] text-muted">{preview.priority.reason}</div>
                  </Card>
                )}
                {preview.possible_duplicates.length > 0 && (
                  <Card className="p-3 border-warn/30 bg-warn/5 text-ink">
                    <div className="text-[12px] font-medium text-warn">Possible duplicates</div>
                    {preview.possible_duplicates.map((d) => (
                      <div key={d.case_id} className="mt-1">
                        <Link to={`/cases/${d.case_id}`} target="_blank" className="font-mono underline">{d.case_id}</Link> · {d.bureau_id.replace('BUR-', '')} · {Math.round(d.score)}%
                        <div className="text-[12px] text-muted">{d.reasons.join(', ')}</div>
                      </div>
                    ))}
                  </Card>
                )}
              </>
            )}
          </aside>
        </form>
      )}
    </Modal>
  );
};

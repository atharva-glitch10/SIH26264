import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Building2, AlertTriangle, CheckCircle2, Copy, FileText, ArrowRight } from 'lucide-react';
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

  const inputClass = 'w-full h-10 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-xs';
  const areaClass = 'w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-xs leading-relaxed';
  const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5';

  const footer = result ? (
    <>
      <Button variant="ghost" onClick={onClose}>Close</Button>
      <Link
        to={`/cases/${result.case_id}`}
        className="inline-flex items-center justify-center gap-1.5 h-10 px-5 text-sm font-semibold rounded-lg bg-brand text-white hover:bg-brand-hover shadow-sm transition-all"
      >
        <span>Open Case Dossier</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </>
  ) : (
    <>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button type="submit" form={FORM_ID} disabled={busy} variant="cta">
        {busy ? 'Registering Grievance…' : 'Register Complaint Case'}
      </Button>
    </>
  );

  return (
    <Modal open onClose={onClose} title="Register New Grievance Case" width="lg" flush footer={footer}>
      {result ? (
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-950 flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-emerald-950 text-base">Complaint Successfully Registered</div>
              <div className="mt-1 text-emerald-800">
                Statutory Reference:{' '}
                <Link to={`/cases/${result.case_id}`} className="font-mono font-bold underline text-emerald-900">
                  {result.complaint_reference}
                </Link>
                {' '}· Expected Resolution (SLA Due): <strong className="text-emerald-950">{new Date(result.expected_disposal_at).toLocaleDateString()}</strong>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-sm text-slate-800">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>Linked College: <strong className="text-slate-900">{result.institution.canonical_name}</strong></span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-mono">
                {result.institution.match_status.replace(/_/g, ' ')} ({Math.round(result.institution.score)}%)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>
                Category: <strong className="text-slate-900">{result.category.value}</strong>
                {result.category.source === 'AUTO' && ` (Suggested, ${pct(result.category.confidence)} confidence)`}
              </span>
              <span>·</span>
              <span>
                Priority: <strong className="text-slate-900">{result.priority.value}</strong>
                {result.priority.source === 'AUTO' && ` (${result.priority.reason})`}
              </span>
            </div>

            {result.duplicate && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <Copy className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Potential duplicate detected:</strong> Matches{' '}
                  <Link className="underline font-mono font-bold" to={`/cases/${result.duplicate.case_id}`}>
                    {result.duplicate.case_id}
                  </Link>{' '}
                  in {result.duplicate.bureau_id} ({Math.round(result.duplicate.score)}% similarity)
                </div>
              </div>
            )}

            {result.overlap_alert_id && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Active cross-bureau overlap alert:</strong> Case alert{' '}
                  <span className="font-mono font-bold">{result.overlap_alert_id}</span> is open for this institution.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form id={FORM_ID} onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="md:col-span-3 p-6 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>Institution Name (as written)</label>
                <input 
                  value={form.institution_name} 
                  onChange={(e) => set('institution_name', e.target.value)} 
                  placeholder="e.g. Aryabhata Instt of Tech, Kanpur" 
                  className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>AICTE Permanent ID</label>
                <input 
                  value={form.aicte_permanent_id} 
                  onChange={(e) => set('aicte_permanent_id', e.target.value)} 
                  placeholder="1-4329811" 
                  className={`${inputClass} font-mono`} 
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Complaint Description / Grievance Text *</label>
              <textarea 
                required 
                minLength={10} 
                rows={4} 
                value={form.description} 
                onChange={(e) => set('description', e.target.value)} 
                placeholder="Paste or type the complaint exactly as received from citizen/portal…" 
                className={areaClass} 
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Receiving Bureau</label>
                <select 
                  value={form.source_bureau_id} 
                  onChange={(e) => set('source_bureau_id', e.target.value)} 
                  disabled={!registerAny} 
                  className={inputClass}
                >
                  {BUREAUS.filter((b) => registerAny || b.id === user?.bureau_id).map((b) => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select 
                  value={form.category} 
                  onChange={(e) => set('category', e.target.value)} 
                  className={inputClass}
                >
                  <option value="">Suggest automatically</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <select 
                  value={form.priority} 
                  onChange={(e) => set('priority', e.target.value)} 
                  className={inputClass}
                >
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
                <label className={labelClass}>Complainant Name</label>
                <input 
                  value={form.complainant_name} 
                  onChange={(e) => set('complainant_name', e.target.value)} 
                  placeholder="Optional"
                  className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>Email / Phone</label>
                <input 
                  value={form.complainant_contact} 
                  onChange={(e) => set('complainant_contact', e.target.value)} 
                  placeholder="Optional"
                  className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>External Ref. No.</label>
                <input 
                  value={form.external_reference} 
                  onChange={(e) => set('external_reference', e.target.value)} 
                  placeholder="e.g. CPGRAMS ID" 
                  className={inputClass} 
                />
              </div>
            </div>

            {error && (
              <div className="text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>

          {/* Real-time ML Pipeline Intelligence Pane */}
          <aside className="md:col-span-2 bg-slate-50/70 p-6 space-y-3.5 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-900 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand" />
                <span className="text-sm">Real-time AI Intake Suggestions</span>
              </div>
              {previewing && <span className="text-slate-500 font-normal animate-pulse">Evaluating…</span>}
            </div>

            {!preview && (
              <div className="text-slate-500 leading-relaxed py-6 text-center">
                Start typing the institution and complaint text to activate real-time fuzzy disambiguation, Naive Bayes categorisation, and duplicate indexing.
              </div>
            )}

            {preview && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Institution Match</div>
                  {preview.institution ? (
                    <>
                      <div className="font-semibold text-slate-900 text-sm">{preview.institution.canonical_name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          preview.institution.match_status === 'PENDING_REVIEW' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {preview.institution.match_status === 'PENDING_REVIEW' ? 'Needs Review' : 'Verified Link'} · {Math.round(preview.institution.score)}%
                        </span>
                      </div>
                      <div className="text-slate-500 mt-1 leading-snug">{preview.institution.details}</div>
                    </>
                  ) : (
                    <div className="text-rose-600 font-medium">{preview.institution_error || 'Not identified yet'}</div>
                  )}
                </div>

                {preview.category && (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Category Classification</div>
                    {preview.category.source === 'AUTO' ? (
                      <>
                        <div className="font-semibold text-slate-900 text-sm">
                          {preview.category.value}{' '}
                          <span className="text-slate-500 text-xs font-normal">({pct(preview.category.confidence)} confidence)</span>
                        </div>
                        {preview.category.evidence.length > 0 && (
                          <div className="text-slate-500 leading-snug">
                            Keywords: <span className="text-slate-700 italic">{preview.category.evidence.join(', ')}</span>
                          </div>
                        )}
                        {preview.category.alternatives[0] && (
                          <div className="text-slate-400 text-[11px]">
                            Next alternative: {preview.category.alternatives[0].category} ({pct(preview.category.alternatives[0].confidence)})
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-slate-800 font-medium">Officer selected · suggested {preview.category.suggested} ({pct(preview.category.suggested_confidence)})</div>
                    )}
                  </div>
                )}

                {preview.priority && (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Suggested Priority & SLA</div>
                    <div className="font-semibold text-slate-900">{preview.priority.priority}</div>
                    <div className="text-slate-500 leading-snug">{preview.priority.reason}</div>
                  </div>
                )}

                {preview.possible_duplicates.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-1.5 shadow-xs">
                    <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Possible Duplicate Complaint ({preview.possible_duplicates.length})
                    </div>
                    {preview.possible_duplicates.map((d) => (
                      <div key={d.case_id} className="pt-1 border-t border-amber-200/60 first:border-0 first:pt-0">
                        <Link to={`/cases/${d.case_id}`} target="_blank" className="font-mono font-bold underline text-amber-900">
                          {d.case_id}
                        </Link>{' '}
                        · Bureau {d.bureau_id.replace('BUR-', '')} · <span className="font-semibold">{Math.round(d.score)}% match</span>
                        <div className="text-amber-800/80 leading-snug mt-0.5">{d.reasons.join(', ')}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        </form>
      )}
    </Modal>
  );
};

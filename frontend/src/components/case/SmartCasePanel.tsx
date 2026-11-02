import React, { useState } from 'react';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
import { AlertTriangle, Sparkles, Building2, User, Radio, Check } from 'lucide-react';
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
import { api } from '../../services/api';
import { CaseDetail } from '../../types';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Tag from '../ui/Tag';

const CATEGORIES = [
  'Academic and Examination',
  'Infrastructure and Facilities',
  'Faculty and Staffing',
  'Regulatory Compliance',
  'Admission Grievances',
  'Fee Related Grievances',
  'General Institutional',
];

<<<<<<< HEAD
const selectClass =
  'h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 shadow-xs cursor-pointer';
=======
const selectClass = 'h-9 px-2.5 text-[13px] bg-white border border-line rounded-sm text-ink';
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

interface Props {
  caseData: CaseDetail;
  canAct: boolean;
  onChanged: () => void;
}

<<<<<<< HEAD
const Pair: React.FC<{ label: string; icon?: React.ReactNode; children: React.ReactNode }> = ({
  label,
  icon,
  children,
}) => (
  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
    <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
      {icon}
      {label}
    </dt>
    <dd className="text-xs text-slate-900 leading-normal">{children}</dd>
=======
const Pair: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <dt className="text-[12px] text-muted">{label}</dt>
    <dd className="mt-0.5">{children}</dd>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
  </div>
);

export const SmartCasePanel: React.FC<Props> = ({ caseData, canAct, onChanged }) => {
  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState(caseData.category);

  const run = async (fn: () => Promise<any>) => {
    setBusy(true);
    try {
      await fn();
      onChanged();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const matchStatus = caseData.institution_match_status || 'CONFIRMED';
  const autoCategory = caseData.category_source === 'AUTO';

  return (
    <Card>
<<<<<<< HEAD
      <CardHeader
        title="Smart Intake & Classification Dossier"
        description="Automated entity linking, NLP categorisation confidence, and duplicate detection findings"
      />
      <CardBody className="space-y-4">
        {/* Possible Duplicate Callout */}
        {caseData.duplicate_of_case_id && (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-900">Potential Duplicate Detected</span>
                  <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900">
                    {Math.round(caseData.duplicate_score || 0)}% text similarity
                  </span>
                </div>
                <p className="text-slate-700 mt-1">
                  Possible repeat filing of{' '}
                  <Link
                    className="font-mono font-semibold text-blue-700 hover:underline"
                    to={`/cases/${caseData.duplicate_of_case_id}`}
                  >
                    {caseData.duplicate_of_case_id}
                  </Link>
                  . Verify previous record before dispatching redundant official inquiries.
                </p>
              </div>
            </div>
            {canAct && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => run(() => api.decideDuplicate(caseData.case_id, 'CONFIRMED'))}
                  className="bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                >
                  Confirm duplicate
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => run(() => api.decideDuplicate(caseData.case_id, 'DISMISSED'))}
                  className="bg-white"
                >
=======
      <CardHeader title="Intake details" />
      <CardBody className="space-y-3">
        {caseData.duplicate_of_case_id && (
          <div className="p-3 rounded-sm border border-line text-[13px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="flex items-start gap-2">
              <Tag tone="warn">Possible duplicate</Tag>
              <span>
                Possible repeat of{' '}
                <Link className="font-mono font-medium underline" to={`/cases/${caseData.duplicate_of_case_id}`}>
                  {caseData.duplicate_of_case_id}
                </Link>{' '}
                ({Math.round(caseData.duplicate_score || 0)}% match). Check before issuing a separate notice.
              </span>
            </span>
            {canAct && (
              <div className="flex gap-2 shrink-0">
                <Button size="sm" disabled={busy} onClick={() => run(() => api.decideDuplicate(caseData.case_id, 'CONFIRMED'))}>
                  Confirm duplicate
                </Button>
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => run(() => api.decideDuplicate(caseData.case_id, 'DISMISSED'))}>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                  Not a duplicate
                </Button>
              </div>
            )}
          </div>
        )}

<<<<<<< HEAD
        {/* 4 Metadata Intelligence Cards */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Pair label="Institution Link" icon={<Building2 className="w-3.5 h-3.5 text-blue-600" />}>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-semibold ${
                  matchStatus === 'PENDING_REVIEW'
                    ? 'text-amber-600'
                    : matchStatus === 'REJECTED'
                    ? 'text-rose-600'
                    : 'text-emerald-700'
                }`}
              >
                {matchStatus.replace(/_/g, ' ')}
              </span>
              {caseData.institution_match_score != null && (
                <span className="text-[11px] text-slate-500 font-mono">
                  ({Math.round(caseData.institution_match_score)}% score)
                </span>
              )}
            </div>
            {caseData.raw_institution_name && (
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-1" title={caseData.raw_institution_name}>
                Raw: “{caseData.raw_institution_name}”
              </div>
            )}
            {matchStatus === 'PENDING_REVIEW' && (
              <Link to="/data-quality" className="text-[11px] text-blue-600 font-medium hover:underline block mt-1">
                Confirm in review queue →
              </Link>
            )}
          </Pair>

          <Pair label="Category & NLP Source" icon={<Sparkles className="w-3.5 h-3.5 text-purple-600" />}>
            <div className="font-semibold text-slate-900">{caseData.category}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {autoCategory ? (
                <span className="text-blue-700 font-medium">
                  Auto-suggested ({Math.round((caseData.category_confidence || 0) * 100)}% conf)
                </span>
              ) : (
                <span className="text-emerald-700 font-medium">Confirmed by officer</span>
              )}
            </div>
            {canAct && (
              <div className="flex gap-1.5 mt-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`${selectClass} flex-1`}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
=======
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-[13px]">
          <Pair label="Institution link">
            <div className={`font-medium ${matchStatus === 'PENDING_REVIEW' ? 'text-warn' : matchStatus === 'REJECTED' ? 'text-bad' : 'text-ok'}`}>
              {matchStatus.replace(/_/g, ' ')}
              {caseData.institution_match_score != null && ` · ${Math.round(caseData.institution_match_score)}%`}
            </div>
            {caseData.raw_institution_name && (
              <div className="text-[12px] text-muted mt-0.5">Written as: “{caseData.raw_institution_name}”</div>
            )}
            {matchStatus === 'PENDING_REVIEW' && (
              <Link to="/data-quality" className="text-[12px] text-brand underline">Confirm in data quality review queue</Link>
            )}
          </Pair>

          <Pair label="Category">
            <div className="font-medium">
              {caseData.category}{' '}
              <span className="text-muted font-normal">
                {autoCategory ? `· suggested (${Math.round((caseData.category_confidence || 0) * 100)}%)` : '· confirmed by officer'}
              </span>
            </div>
            {canAct && (
              <div className="flex gap-1.5 mt-1.5">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${selectClass} flex-1`}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                </select>
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => run(() => api.updateCase(caseData.case_id, { category }))}
<<<<<<< HEAD
                  className="px-2.5 h-9 text-xs"
=======
                  title="Confirming improves future suggestions"
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                >
                  {autoCategory && category === caseData.category ? 'Confirm' : 'Save'}
                </Button>
              </div>
            )}
          </Pair>

<<<<<<< HEAD
          <Pair label="Complainant Identity" icon={<User className="w-3.5 h-3.5 text-slate-600" />}>
            <div className="font-semibold text-slate-900">{caseData.complainant_name || 'Anonymous / Confidential'}</div>
            {caseData.complainant_contact && (
              <div className="text-[11px] text-slate-500 font-mono mt-1">{caseData.complainant_contact}</div>
            )}
          </Pair>

          <Pair label="Intake Channel" icon={<Radio className="w-3.5 h-3.5 text-indigo-600" />}>
            <div className="font-semibold text-slate-900">{(caseData.intake_channel || 'MANUAL').replace(/_/g, ' ')}</div>
            {caseData.external_reference && (
              <div className="text-[11px] text-slate-500 font-mono mt-1">
                Ref: {caseData.external_reference}
              </div>
            )}
=======
          <Pair label="Complainant">
            <div>{caseData.complainant_name || 'Not recorded'}</div>
            {caseData.complainant_contact && <div className="text-[12px] text-muted">{caseData.complainant_contact}</div>}
          </Pair>

          <Pair label="Intake channel">
            <div>{(caseData.intake_channel || 'MANUAL').replace(/_/g, ' ')}</div>
            {caseData.external_reference && <div className="text-[12px] text-muted font-mono">Source ref: {caseData.external_reference}</div>}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          </Pair>
        </dl>
      </CardBody>
    </Card>
  );
};
<<<<<<< HEAD

export default SmartCasePanel;
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

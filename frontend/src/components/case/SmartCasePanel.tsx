import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

const selectClass = 'h-9 px-2.5 text-[13px] bg-white border border-line rounded-sm text-ink';

interface Props {
  caseData: CaseDetail;
  canAct: boolean;
  onChanged: () => void;
}

const Pair: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <dt className="text-[12px] text-muted">{label}</dt>
    <dd className="mt-0.5">{children}</dd>
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
                  Not a duplicate
                </Button>
              </div>
            )}
          </div>
        )}

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
                </select>
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => run(() => api.updateCase(caseData.case_id, { category }))}
                  title="Confirming improves future suggestions"
                >
                  {autoCategory && category === caseData.category ? 'Confirm' : 'Save'}
                </Button>
              </div>
            )}
          </Pair>

          <Pair label="Complainant">
            <div>{caseData.complainant_name || 'Not recorded'}</div>
            {caseData.complainant_contact && <div className="text-[12px] text-muted">{caseData.complainant_contact}</div>}
          </Pair>

          <Pair label="Intake channel">
            <div>{(caseData.intake_channel || 'MANUAL').replace(/_/g, ' ')}</div>
            {caseData.external_reference && <div className="text-[12px] text-muted font-mono">Source ref: {caseData.external_reference}</div>}
          </Pair>
        </dl>
      </CardBody>
    </Card>
  );
};

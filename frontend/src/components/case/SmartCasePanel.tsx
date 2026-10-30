import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { CaseDetail } from '../../types';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { selectClass } from '../ui/styles';

const CATEGORIES = [
  'Academic and Examination',
  'Infrastructure and Facilities',
  'Faculty and Staffing',
  'Regulatory Compliance',
  'Admission Grievances',
  'Fee Related Grievances',
  'General Institutional',
];

interface Props {
  caseData: CaseDetail;
  canAct: boolean;
  onChanged: () => void;
}

const Cell: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="p-3 rounded-sm bg-page border border-border text-sm">
    <div className="text-xs text-muted">{label}</div>
    {children}
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
      <CardHeader title="Intake results" />
      <CardBody className="space-y-3">
        {caseData.duplicate_of_case_id && (
          <div className="p-3 rounded-sm bg-warning/10 border border-warning/30 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              Possible repeat of{' '}
              <Link className="font-mono font-medium underline" to={`/cases/${caseData.duplicate_of_case_id}`}>
                {caseData.duplicate_of_case_id}
              </Link>{' '}
              ({Math.round(caseData.duplicate_score || 0)}% match). Check before issuing a separate notice.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Cell label="Institution link">
            <div className={`mt-0.5 font-medium ${matchStatus === 'PENDING_REVIEW' ? 'text-warning' : matchStatus === 'REJECTED' ? 'text-danger' : 'text-success'}`}>
              {matchStatus.replace(/_/g, ' ')}
              {caseData.institution_match_score != null && ` · ${Math.round(caseData.institution_match_score)}%`}
            </div>
            {caseData.raw_institution_name && (
              <div className="text-xs text-muted mt-0.5">Written as: “{caseData.raw_institution_name}”</div>
            )}
            {matchStatus === 'PENDING_REVIEW' && (
              <Link to="/data-quality" className="text-xs underline">Confirm in data quality review queue</Link>
            )}
          </Cell>

          <Cell label="Category">
            <div className="mt-0.5 font-medium">
              {caseData.category}{' '}
              <span className="text-muted font-normal">
                {autoCategory ? `· suggested (${Math.round((caseData.category_confidence || 0) * 100)}%)` : '· confirmed by officer'}
              </span>
            </div>
            {canAct && (
              <div className="flex gap-1.5 mt-1.5">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${selectClass} flex-1 h-8`}>
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
          </Cell>

          <Cell label="Complainant">
            <div className="mt-0.5">{caseData.complainant_name || 'Not recorded'}</div>
            {caseData.complainant_contact && <div className="text-xs text-muted">{caseData.complainant_contact}</div>}
          </Cell>

          <Cell label="Intake channel">
            <div className="mt-0.5">{(caseData.intake_channel || 'MANUAL').replace(/_/g, ' ')}</div>
            {caseData.external_reference && <div className="text-xs text-muted font-mono">Source ref: {caseData.external_reference}</div>}
          </Cell>
        </div>
      </CardBody>
    </Card>
  );
};

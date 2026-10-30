import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import Tag, { TagTone } from '../components/ui/Tag';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

const Rules: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-3 rounded-sm bg-page border border-border space-y-1 text-sm">{children}</div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card>
    <CardHeader title={title} />
    <CardBody className="space-y-3 text-sm">{children}</CardBody>
  </Card>
);

const SLA: { label: string; days: number; tone: TagTone }[] = [
  { label: 'Urgent', days: 15, tone: 'danger' },
  { label: 'High', days: 30, tone: 'warning' },
  { label: 'Medium', days: 45, tone: 'neutral' },
  { label: 'Low', days: 60, tone: 'neutral' },
];

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="System Settings and Engine Rules"
        description="Active configuration governing SLA thresholds, workflow state transitions and cross-bureau overlap detection."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Workflow state transitions">
          <Rules>
            <div><strong>RECEIVED</strong> → PENDING, UNDER_PROCESS, TRANSFERRED</div>
            <div><strong>PENDING</strong> → UNDER_PROCESS, TRANSFERRED, ESCALATED</div>
            <div><strong>UNDER_PROCESS</strong> → TRANSFERRED, ESCALATED, DISPOSED</div>
            <div><strong>TRANSFERRED</strong> → PENDING, UNDER_PROCESS, ESCALATED</div>
            <div><strong>ESCALATED</strong> → UNDER_PROCESS, DISPOSED</div>
            <div><strong>DISPOSED</strong> → CLOSED, UNDER_PROCESS (Reopen)</div>
          </Rules>
          <p className="text-xs text-muted">
            Transitions are validated on the backend API. Arbitrary status modifications without action records are rejected.
          </p>
        </Section>

        <Section title="SLA resolution windows">
          <div className="grid grid-cols-2 gap-2">
            {SLA.map((s) => (
              <div key={s.label} className="p-2 rounded-sm border border-border flex items-center justify-between">
                <Tag tone={s.tone}>{s.label}</Tag>
                <span className="font-medium">{s.days} days</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted">
            Approaching deadline warnings fire within 7 days and 3 days of target disposal date.
          </p>
        </Section>

        <Section title="Overlap engine triggers">
          <Rules>
            <div><strong>Rule A:</strong> ≥ 2 active cases on same institution across ≥ 2 Bureaus (MEDIUM; HIGH if any case is High/Urgent)</div>
            <div><strong>Rule B:</strong> A cross-bureau pair shares the same or a related category cluster (HIGH)</div>
            <div><strong>Rule C:</strong> Cross-bureau descriptions ≥ 70% similar after removing the institution name (CRITICAL)</div>
            <div><strong>Rule D:</strong> One open alert per institution + bureau set; re-scans update it instead of duplicating</div>
          </Rules>
        </Section>

        <Section title="Matching safety margins">
          <Rules>
            <div><strong>AICTE Permanent ID match:</strong> 100% direct link</div>
            <div><strong>Canonical exact match:</strong> 100% direct link</div>
            <div><strong>Verified alias:</strong> 98% direct link</div>
            <div><strong>Score ≥ 90%:</strong> auto-match if the next candidate is ≥ 10 points lower</div>
            <div><strong>Score 75 - 89% or ambiguous:</strong> case created as "pending review" and routed to the verification queue</div>
            <div><strong>Fuzzy score:</strong> 70% distinctive name words + 30% full name; abbreviations (Engg, Instt, Mgmt…) expanded</div>
          </Rules>
        </Section>

        <Section title="Intake: categorisation and duplicates">
          <Rules>
            <div><strong>Category:</strong> Naive Bayes classifier suggests a category with confidence; officer corrections retrain it</div>
            <div><strong>Priority hint:</strong> safety terms (ragging, fire, assault…) → URGENT; capitation, withheld certificates… → HIGH</div>
            <div><strong>Duplicate score:</strong> 70% paraphrase-tolerant text similarity + 20% same complainant + 7% same category + 3% date proximity</div>
            <div><strong>Flag at:</strong> ≥ 60 (look-back 180 days, all bureaus) · proposed link, officer confirms or dismisses</div>
          </Rules>
        </Section>

        <Section title="Background SLA monitor (every 15 min)">
          <Rules>
            <div><strong>Reminders:</strong> 7, 3 and 1 day before the SLA deadline</div>
            <div><strong>Breach alert:</strong> once a case passes its deadline</div>
            <div><strong>Stagnant case:</strong> no action for 14 days (repeats every 14 days)</div>
            <div><strong>Transfer not acknowledged:</strong> still TRANSFERRED after 5 days</div>
            <div><strong>Auto-escalation:</strong> when elapsed time reaches 1.5× the SLA window</div>
          </Rules>
        </Section>
      </div>
    </div>
  );
};

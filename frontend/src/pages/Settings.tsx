import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import Tag, { TagTone } from '../components/ui/Tag';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

const Rules: React.FC<{ items: { term: string; detail: string }[] }> = ({ items }) => (
  <dl className="rounded-sm border border-line divide-y divide-line text-[13px]">
    {items.map((item) => (
      <div key={item.term} className="px-3 py-2">
        <dt className="font-semibold text-ink">{item.term}</dt>
        <dd className="text-muted">{item.detail}</dd>
      </div>
    ))}
  </dl>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card>
    <CardHeader title={title} />
    <CardBody className="space-y-3 text-[13px]">{children}</CardBody>
  </Card>
);

const SLA: { label: string; days: number; tone: TagTone }[] = [
  { label: 'Urgent', days: 15, tone: 'bad' },
  { label: 'High', days: 30, tone: 'warn' },
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
          <Rules
            items={[
              { term: 'RECEIVED', detail: 'PENDING, UNDER_PROCESS, TRANSFERRED' },
              { term: 'PENDING', detail: 'UNDER_PROCESS, TRANSFERRED, ESCALATED' },
              { term: 'UNDER_PROCESS', detail: 'TRANSFERRED, ESCALATED, DISPOSED' },
              { term: 'TRANSFERRED', detail: 'PENDING, UNDER_PROCESS, ESCALATED' },
              { term: 'ESCALATED', detail: 'UNDER_PROCESS, DISPOSED' },
              { term: 'DISPOSED', detail: 'CLOSED, UNDER_PROCESS (Reopen)' },
            ]}
          />
          <p className="text-[12px] text-muted">
            Transitions are validated on the backend API. Arbitrary status modifications without action records are rejected.
          </p>
        </Section>

        <Section title="SLA resolution windows">
          <dl className="rounded-sm border border-line divide-y divide-line text-[13px]">
            {SLA.map((s) => (
              <div key={s.label} className="px-3 py-2 flex items-center justify-between">
                <dt><Tag tone={s.tone}>{s.label}</Tag></dt>
                <dd className="font-medium tabular-nums">{s.days} days</dd>
              </div>
            ))}
          </dl>
          <p className="text-[12px] text-muted">
            Approaching deadline warnings fire within 7 days and 3 days of target disposal date.
          </p>
        </Section>

        <Section title="Overlap engine triggers">
          <Rules
            items={[
              { term: 'Rule A', detail: '≥ 2 active cases on same institution across ≥ 2 Bureaus (MEDIUM; HIGH if any case is High/Urgent)' },
              { term: 'Rule B', detail: 'A cross-bureau pair shares the same or a related category cluster (HIGH)' },
              { term: 'Rule C', detail: 'Cross-bureau descriptions ≥ 70% similar after removing the institution name (CRITICAL)' },
              { term: 'Rule D', detail: 'One open alert per institution + bureau set; re-scans update it instead of duplicating' },
            ]}
          />
        </Section>

        <Section title="Matching safety margins">
          <Rules
            items={[
              { term: 'AICTE Permanent ID match', detail: '100% direct link' },
              { term: 'Canonical exact match', detail: '100% direct link' },
              { term: 'Verified alias', detail: '98% direct link' },
              { term: 'Score ≥ 90%', detail: 'auto-match if the next candidate is ≥ 10 points lower' },
              { term: 'Score 75 - 89% or ambiguous', detail: 'case created as "pending review" and routed to the verification queue' },
              { term: 'Fuzzy score', detail: '70% distinctive name words + 30% full name; abbreviations (Engg, Instt, Mgmt…) expanded' },
            ]}
          />
        </Section>

        <Section title="Intake: categorisation and duplicates">
          <Rules
            items={[
              { term: 'Category', detail: 'Naive Bayes classifier suggests a category with confidence; officer corrections retrain it' },
              { term: 'Priority hint', detail: 'safety terms (ragging, fire, assault…) → URGENT; capitation, withheld certificates… → HIGH' },
              { term: 'Duplicate score', detail: '70% paraphrase-tolerant text similarity + 20% same complainant + 7% same category + 3% date proximity' },
              { term: 'Flag at', detail: '≥ 60 (look-back 180 days, all bureaus) · proposed link, officer confirms or dismisses' },
            ]}
          />
        </Section>

        <Section title="Background SLA monitor (every 15 min)">
          <Rules
            items={[
              { term: 'Reminders', detail: '7, 3 and 1 day before the SLA deadline' },
              { term: 'Breach alert', detail: 'once a case passes its deadline' },
              { term: 'Stagnant case', detail: 'no action for 14 days (repeats every 14 days)' },
              { term: 'Transfer not acknowledged', detail: 'still TRANSFERRED after 5 days' },
              { term: 'Auto-escalation', detail: 'when elapsed time reaches 1.5× the SLA window' },
            ]}
          />
        </Section>
      </div>
    </div>
  );
};

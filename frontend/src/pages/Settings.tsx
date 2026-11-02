import React from 'react';
import { GitBranch, Clock, AlertTriangle, ShieldCheck, Sparkles, RefreshCw, Cpu } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Tag, { TagTone } from '../components/ui/Tag';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

const Rules: React.FC<{ items: { term: string; detail: string; badge?: string }[] }> = ({ items }) => (
  <dl className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm overflow-hidden bg-white shadow-xs">
    {items.map((item) => (
      <div key={item.term} className="px-4 py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 hover:bg-slate-50/50 transition-colors">
        <dt className="font-semibold text-slate-900 shrink-0 sm:w-44 flex items-center gap-2">
          {item.term}
          {item.badge && (
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
              {item.badge}
            </span>
          )}
        </dt>
        <dd className="text-slate-600 leading-relaxed sm:text-right">{item.detail}</dd>
      </div>
    ))}
  </dl>
);

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <Card className="shadow-xs border-slate-200">
    <CardHeader 
      title={
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
          {icon}
          <span>{title}</span>
        </div>
      } 
    />
    <CardBody className="space-y-3.5 text-sm">{children}</CardBody>
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="System Settings & Engine Governance Rules"
        description="Active algorithmic thresholds governing statutory SLA timers, finite-state transitions, and AI overlap detection."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Workflow State Transitions" icon={<GitBranch className="w-4 h-4 text-brand" />}>
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
          <p className="text-xs text-slate-500 leading-normal">
            Transitions are enforced by backend state machine validators. Arbitrary status modifications without accompanying audit action logs are rejected.
          </p>
        </Section>

        <Section title="SLA Resolution Windows" icon={<Clock className="w-4 h-4 text-amber-600" />}>
          <dl className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm overflow-hidden bg-white shadow-xs">
            {SLA.map((s) => (
              <div key={s.label} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <dt><Tag tone={s.tone}>{s.label}</Tag></dt>
                <dd className="font-semibold text-slate-900 font-mono tabular-nums bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  {s.days} statutory days
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-slate-500 leading-normal">
            Automated impending deadline notifications trigger within 7 days, 3 days, and 24 hours of target disposal cutoff.
          </p>
        </Section>

        <Section title="Cross-Bureau Overlap Triggers" icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}>
          <Rules
            items={[
              { term: 'Rule A (Multi-Bureau)', detail: '≥ 2 active cases on same college across ≥ 2 Bureaus (MEDIUM; HIGH if any High/Urgent)' },
              { term: 'Rule B (Category Cluster)', detail: 'A cross-bureau pair shares identical or correlated allegation cluster (HIGH)' },
              { term: 'Rule C (Semantic Overlap)', detail: 'Cross-bureau descriptions ≥ 70% similar after removing college tokens (CRITICAL)' },
              { term: 'Rule D (Idempotent Scan)', detail: 'One active alert maintained per college + bureau set; auto-updated on subsequent filings' },
            ]}
          />
        </Section>

        <Section title="Entity Disambiguation Margins" icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}>
          <Rules
            items={[
              { term: 'Permanent ID match', detail: '100% deterministic link directly into canonical profile' },
              { term: 'Canonical exact match', detail: '100% token exact link' },
              { term: 'Verified alias table', detail: '98% direct link via vetted historical registrar aliases' },
              { term: 'Score ≥ 90%', detail: 'Auto-link if margin from second candidate is ≥ 10 points' },
              { term: 'Score 75% – 89%', detail: 'Flagged as PENDING_REVIEW and routed to registrar quality queue' },
              { term: 'Weighted Fuzzy Token', detail: '70% distinctive root words + 30% sequence; standard acronyms expanded' },
            ]}
          />
        </Section>

        <Section title="Intake NLP & Duplicate Scoring" icon={<Sparkles className="w-4 h-4 text-indigo-600" />}>
          <Rules
            items={[
              { term: 'Category Suggestion', detail: 'Multinomial Naive Bayes categoriser with confidence scoring & feedback loop' },
              { term: 'Priority Heuristics', detail: 'Safety terms (ragging, fire, assault) → URGENT; capitation, certificates → HIGH' },
              { term: 'Duplicate Similarity', detail: '70% text embedding + 20% complainant phone/email + 7% category + 3% date delta' },
              { term: 'Duplicate Alert Cutoff', detail: 'Score ≥ 60 (180-day retrospective window across all bureaus)' },
            ]}
          />
        </Section>

        <Section title="Autonomous Background Monitor" icon={<RefreshCw className="w-4 h-4 text-teal-600" />}>
          <Rules
            items={[
              { term: 'Cycle cadence', detail: 'Runs every 15 minutes as an autonomous daemon' },
              { term: 'Impending warnings', detail: 'Triggers reminders 7, 3, and 1 day prior to statutory SLA breach' },
              { term: 'Breach notice', detail: 'Immediate executive alert logged upon deadline expiration' },
              { term: 'Stagnant case sweep', detail: 'Flags complaints with 0 action logs for 14 continuous days' },
              { term: 'Transfer watchdog', detail: 'Notifies receiving bureau head after 5 days in unacknowledged TRANSFERRED state' },
            ]}
          />
        </Section>
      </div>
    </div>
  );
};

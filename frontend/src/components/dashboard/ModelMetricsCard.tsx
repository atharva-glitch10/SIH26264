import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { Cpu, CheckCircle2, Split, Building2, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { ModelMetrics } from '../../types';
import { Card, CardHeader, CardBody } from '../ui/Card';

const pct = (v?: number | null) => (v == null ? '—' : `${(v * 100).toFixed(1)}%`);

=======
import { api } from '../../services/api';
import { ModelMetrics } from '../../types';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { StatCard } from '../ui/StatCard';

const pct = (v?: number | null) => (v == null ? '—' : `${(v * 100).toFixed(1)}%`);

const Metric: React.FC<{ title: string; big: string; lines: string[] }> = ({ title, big, lines }) => (
  <StatCard label={title} value={big} helper={lines.join(' · ')} />
);

>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
export const ModelMetricsCard: React.FC = () => {
  const [m, setM] = useState<ModelMetrics | null>(null);
  useEffect(() => {
    api.getModelMetrics().then(setM).catch(() => setM(null));
  }, []);
  if (!m) return null;

  return (
<<<<<<< HEAD
    <Card className="overflow-hidden border-indigo-100 shadow-sm">
      <CardHeader 
        title={
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
            <Cpu className="w-5 h-5 text-brand" />
            <span>AI Matching & NLP Accuracy Benchmarks</span>
          </div>
        }
        actions={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5" />
            Active ML Pipeline
          </span>
        }
      />
      <CardBody className="space-y-4">
        {!m.available ? (
          <div className="text-sm text-slate-500 py-3">No evaluation yet. {m.message}</div>
=======
    <Card>
      <CardHeader title="Measured accuracy of automated matching" />
      <CardBody className="space-y-3">
        {!m.available ? (
          <div className="text-[13px] text-muted">No evaluation yet. {m.message}</div>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {m.classifier && (
<<<<<<< HEAD
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Complaint Categorisation
                    </span>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Top-2: {pct(m.classifier.top2_accuracy)}
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-display text-slate-900">
                    {pct(m.classifier.accuracy)}
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    Accuracy on {m.classifier.test_size} held-out complaints · Macro-F1: <strong className="text-slate-800">{m.classifier.macro_f1.toFixed(2)}</strong>
                  </p>
                </div>
              )}

              {m.duplicate_detection && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Duplicate Detection
                    </span>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      F1: {m.duplicate_detection.f1.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-display text-slate-900">
                    Precision {pct(m.duplicate_detection.precision)}
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    Recall: <strong className="text-slate-800">{pct(m.duplicate_detection.recall)}</strong> · {m.duplicate_detection.pairs} labelled pairs (threshold {m.duplicate_detection.threshold})
                  </p>
                </div>
              )}

              {m.institution_matching && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Institution Auto-Link
                    </span>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {pct(m.institution_matching.auto_linked_pct)} auto-linked
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-display text-slate-900">
                    {pct(m.institution_matching.auto_link_precision)}
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    {pct(m.institution_matching.sent_to_review_pct)} sent to queue · {m.institution_matching.wrong_auto_links} wrong in {m.institution_matching.variants_tested} noisy names
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>{m.disclaimer}</span>
              <span className="font-mono">
                Generated {m.generated_at ? new Date(m.generated_at).toLocaleString('en-IN') : ''} · Matcher: {m.fuzzy_backend}
              </span>
=======
                <Metric
                  title="Complaint categorisation"
                  big={pct(m.classifier.accuracy)}
                  lines={[
                    `accuracy on ${m.classifier.test_size} held-out complaints`,
                    `top-2 accuracy ${pct(m.classifier.top2_accuracy)} · macro-F1 ${m.classifier.macro_f1.toFixed(2)}`,
                  ]}
                />
              )}
              {m.duplicate_detection && (
                <Metric
                  title="Duplicate detection"
                  big={`P ${pct(m.duplicate_detection.precision)}`}
                  lines={[
                    `recall ${pct(m.duplicate_detection.recall)} · F1 ${m.duplicate_detection.f1.toFixed(2)}`,
                    `${m.duplicate_detection.pairs} labelled pairs, threshold ${m.duplicate_detection.threshold}`,
                  ]}
                />
              )}
              {m.institution_matching && (
                <Metric
                  title="Institution auto-linking"
                  big={pct(m.institution_matching.auto_link_precision)}
                  lines={[
                    `precision · ${pct(m.institution_matching.auto_linked_pct)} auto-linked, ${pct(m.institution_matching.sent_to_review_pct)} sent to review`,
                    `${m.institution_matching.wrong_auto_links} wrong merges in ${m.institution_matching.variants_tested} noisy names · ` +
                      `${m.institution_matching.unknown_colleges_wrongly_auto_linked}/${m.institution_matching.unknown_colleges_tested} unknown colleges linked`,
                  ]}
                />
              )}
            </div>
            <div className="text-[12px] text-muted">
              {m.disclaimer} Generated {m.generated_at ? new Date(m.generated_at).toLocaleString() : ''} · matcher backend: {m.fuzzy_backend}.
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

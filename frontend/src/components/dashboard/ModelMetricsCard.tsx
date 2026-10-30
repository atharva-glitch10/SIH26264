import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ModelMetrics } from '../../types';
import { Card, CardHeader, CardBody } from '../ui/Card';

const pct = (v?: number | null) => (v == null ? '—' : `${(v * 100).toFixed(1)}%`);

const Metric: React.FC<{ title: string; big: string; lines: string[] }> = ({ title, big, lines }) => (
  <div className="p-4 rounded-sm bg-page border border-border">
    <div className="text-sm text-muted">{title}</div>
    <div className="text-2xl font-semibold text-ink mt-1">{big}</div>
    {lines.map((l) => (
      <div key={l} className="text-xs text-muted">{l}</div>
    ))}
  </div>
);

export const ModelMetricsCard: React.FC = () => {
  const [m, setM] = useState<ModelMetrics | null>(null);
  useEffect(() => {
    api.getModelMetrics().then(setM).catch(() => setM(null));
  }, []);
  if (!m) return null;

  return (
    <Card>
      <CardHeader title="Measured accuracy of automated matching" />
      <CardBody className="space-y-3">
        {!m.available ? (
          <div className="text-sm text-muted">No evaluation yet. {m.message}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {m.classifier && (
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
            <div className="text-xs text-muted">
              {m.disclaimer} Generated {m.generated_at ? new Date(m.generated_at).toLocaleString() : ''} · matcher backend: {m.fuzzy_backend}.
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

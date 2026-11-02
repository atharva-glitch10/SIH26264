import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { Footer } from '../../components/layout/Footer';

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  intro?: React.ReactNode;
  sections: LegalSection[];
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ title, lastUpdated, intro, sections }) => (
  <div className="min-h-screen flex flex-col bg-page print:bg-white">
    <div className="border-b border-border bg-surface px-6 py-3 flex items-center justify-between print:hidden">
      <div>
        <span className="text-base font-semibold text-brand">AICTE</span>
        <span className="ml-2 text-xs text-muted">Complaint Monitoring System</span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/terms" className="hover:underline">Terms of Use</Link>
        <Link to="/privacy" className="hover:underline">Privacy Notice</Link>
        <Link to="/login" className="hover:underline">Sign in</Link>
      </div>
    </div>

    <main className="flex-1 px-4 py-10">
      <article className="mx-auto w-full max-w-[760px]">
        <PageHeader title={title} description={<>Last updated: {lastUpdated}</>} />

        <div className="mb-6 p-3 rounded-sm border border-warning/40 bg-warning/5 text-sm">
          Prototype text for SIH 2026 — to be reviewed by AICTE's legal team before use.
        </div>

        {intro && <p className="mb-6 text-sm leading-relaxed">{intro}</p>}

        <nav aria-label="Contents" className="mb-8 p-4 rounded-md border border-border bg-surface print:border-0 print:p-0">
          <h2 className="text-sm font-semibold mb-2">Contents</h2>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            {sections.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} className="hover:underline">{s.title}</a></li>
            ))}
          </ol>
        </nav>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-6 break-inside-avoid-page">
              <h2 className="text-base font-semibold mb-2">{i + 1}. {s.title}</h2>
              <div className="text-sm leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 text-right text-sm print:hidden">
          <button type="button" onClick={() => window.print()} className="text-brand-accent hover:underline">
            Print this page
          </button>
        </div>
      </article>
    </main>

    <Footer />
  </div>
);

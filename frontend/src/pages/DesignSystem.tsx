import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Skeleton, { SkeletonRows } from '../components/ui/Skeleton';
import { Input, Select, Textarea } from '../components/ui/Field';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Table, Td, Th, Tr } from '../components/ui/DataTable';
import { useToast } from '../components/ui/Toast';
import { fadeUp } from '../lib/motion';

// [token class, label, hex, contrast note]
const SWATCHES: [string, string, string, string][] = [
  ['bg-brand', 'Brand (primary)', '#1B2A6B', 'White text 13.2:1'],
  ['bg-brand-hover', 'Brand hover', '#121C4F', 'White text 16.1:1'],
  ['bg-brand-soft', 'Brand soft', '#E8ECF8', 'Navy text 11.2:1'],
  ['bg-brand-accent', 'Link / focus', '#2547C4', 'On white 7.6:1'],
  ['bg-accent', 'Accent (saffron)', '#F5A524', 'Ink text 8.7:1 · fills only'],
  ['bg-accent-soft', 'Accent soft', '#FDF1DC', 'Accent-ink text 8.0:1'],
  ['bg-ink', 'Ink', '#0F172A', 'On white 17.9:1'],
  ['bg-muted', 'Muted', '#4A5568', 'On white 7.5:1'],
  ['bg-border-strong', 'Control border', '#808A9E', '3:1 non-text'],
  ['bg-success', 'Success', '#146C35', 'On white 6.5:1'],
  ['bg-warning', 'Warning', '#9A4A00', 'On white 6.3:1'],
  ['bg-danger', 'Danger', '#C62222', 'On white 5.8:1'],
];

const SCALE: [string, string][] = [
  ['text-xs', '12 · Caption, badges'],
  ['text-sm', '14 · Body small, tables, buttons'],
  ['text-base', '16 · Body'],
  ['text-xl', '20 · Section title'],
  ['text-2xl', '24 · Page title'],
  ['text-3xl', '32 · Key figures'],
  ['text-5xl', '48 · Display'],
];

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-xl">{title}</h2>
    {children}
  </section>
);

export const DesignSystem: React.FC = () => {
  const toast = useToast();
  const [open, setOpen] = useState(false);

  return (
    <motion.div {...fadeUp} className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <PageHeader
        title="Design System"
        description="Tokens and components for the AICTE Complaint Monitoring System. Light mode only; colours are CSS variables in index.css."
        actions={<Button variant="cta" onClick={() => toast('This is how a toast looks.', 'success')}>Show toast</Button>}
      />

      <Section title="Colour">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SWATCHES.map(([cls, name, hex, note]) => (
            <Card key={name} className="overflow-hidden">
              <div className={`h-14 ${cls}`} />
              <div className="p-3">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted">{hex} · {note}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <Card>
          <CardBody className="space-y-2">
            {SCALE.map(([cls, label]) => (
              <div key={cls} className="flex items-baseline gap-4">
                <span className="w-56 shrink-0 text-xs text-muted">{label}</span>
                <span className={`${cls} ${['text-xl', 'text-2xl', 'text-3xl', 'text-5xl'].includes(cls) ? 'font-display font-semibold' : ''}`}>
                  Complaint monitoring
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      </Section>

      <Section title="Buttons">
        <Card>
          <CardBody className="flex flex-wrap items-center gap-3">
            <Button variant="cta">Primary action (CTA)</Button>
            <Button>Confirm</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Delete</Button>
            <Button loading>Saving</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm" variant="secondary">Small</Button>
          </CardBody>
        </Card>
      </Section>

      <Section title="Badges">
        <Card>
          <CardBody className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="brand">Brand</Badge>
            <Badge tone="accent">Accent</Badge>
            <Badge tone="success">Disposed</Badge>
            <Badge tone="warning">Pending</Badge>
            <Badge tone="danger">Overdue</Badge>
            <Badge tone="info">Under process</Badge>
          </CardBody>
        </Card>
      </Section>

      <Section title="Form controls">
        <Card>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Input label="Institution name" placeholder="e.g. Aryabhata Institute of Technology" hint="As written in the complaint." />
            <Input label="Permanent ID" defaultValue="1-4" error="Enter the full ID, e.g. 1-4329811." />
            <Select label="Receiving bureau" defaultValue="BUR-PGRC">
              <option value="BUR-PGRC">Public Grievance Cell (PGRC)</option>
              <option value="BUR-RB">Regulation Bureau (RB)</option>
            </Select>
            <Input label="Disabled" disabled defaultValue="Read only" />
            <div className="sm:col-span-2">
              <Textarea label="Remarks" rows={3} placeholder="Add context for the next officer…" />
            </div>
          </CardBody>
        </Card>
      </Section>

      <Section title="Cards, stat cards and table">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total complaints" value="1,284" helper="Across 60 institutions" />
          <StatCard label="Overdue" value="37" helper="Past SLA target" />
          <StatCard label="Disposal rate" value="68%" delta="+4 pts" />
        </div>
        <Card className="overflow-hidden">
          <CardHeader title="Recent cases" actions={<Button size="sm" variant="secondary">Export</Button>} />
          <Table>
            <thead>
              <tr><Th>Reference</Th><Th>Institution</Th><Th>Status</Th><Th className="text-right">Days open</Th></tr>
            </thead>
            <tbody>
              <Tr><Td>CMP/2026/0412</Td><Td>Aryabhata Institute</Td><Td><Badge tone="info">Under process</Badge></Td><Td className="text-right tabular-nums">12</Td></Tr>
              <Tr><Td>CMP/2026/0398</Td><Td>Bhaskara College</Td><Td><Badge tone="danger">Overdue</Badge></Td><Td className="text-right tabular-nums">41</Td></Tr>
              <Tr><Td>CMP/2026/0377</Td><Td>Charaka Polytechnic</Td><Td><Badge tone="success">Disposed</Badge></Td><Td className="text-right tabular-nums">28</Td></Tr>
            </tbody>
          </Table>
        </Card>
      </Section>

      <Section title="Loading, empty and error states">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader title="Skeleton" />
            <div className="p-4"><Skeleton className="mb-3 h-8 w-24" /></div>
            <SkeletonRows rows={4} className="pt-0" />
          </Card>
          <Card>
            <EmptyState
              icon={Inbox}
              title="No cases yet"
              description="Cases that match your filters will appear here."
              action={<Button variant="cta" size="sm">File a complaint</Button>}
            />
          </Card>
          <Card><ErrorState onRetry={() => toast('Retrying…', 'info')} /></Card>
        </div>
      </Section>

      <Section title="Modal">
        <Button variant="secondary" onClick={() => setOpen(true)}>Open modal</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Escalate case"
          footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button variant="danger" onClick={() => setOpen(false)}>Confirm escalation</Button></>}
        >
          <Textarea label="Justification" rows={3} hint="Escalation sets priority to Urgent and notifies senior management." />
        </Modal>
      </Section>
    </motion.div>
  );
};

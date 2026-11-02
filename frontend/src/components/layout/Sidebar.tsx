import React from 'react';
import { Link, NavLink } from 'react-router-dom';
<<<<<<< HEAD
import {
  LayoutDashboard,
  Building2,
  FileText,
  GitMerge,
  GitBranch,
  UploadCloud,
  ShieldCheck,
  BarChart3,
  Sliders,
  Sparkles,
} from 'lucide-react';
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
import { TKey, useT } from '../../i18n';

interface SidebarProps {
  unresolvedOverlapsCount?: number;
  overdueCasesCount?: number;
}

interface NavEntry {
  name: TKey;
  to: string;
<<<<<<< HEAD
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  countTone?: 'bad' | 'warn';
=======
  count?: number;
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
}

export const Sidebar: React.FC<SidebarProps> = ({
  unresolvedOverlapsCount = 0,
  overdueCasesCount = 0
}) => {
  const { t } = useT();
<<<<<<< HEAD

=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
  const groups: { label: string; items: NavEntry[] }[] = [
    {
      label: 'Monitoring',
      items: [
<<<<<<< HEAD
        { name: 'nav.overview', to: '/', icon: LayoutDashboard },
        { name: 'nav.institutions', to: '/institutions', icon: Building2 },
        { name: 'nav.allCases', to: '/cases', icon: FileText, count: overdueCasesCount, countTone: 'bad' },
        { name: 'nav.overlapAlerts', to: '/overlaps', icon: GitMerge, count: unresolvedOverlapsCount, countTone: 'warn' },
=======
        { name: 'nav.overview', to: '/' },
        { name: 'nav.institutions', to: '/institutions' },
        { name: 'nav.allCases', to: '/cases', count: overdueCasesCount },
        { name: 'nav.overlapAlerts', to: '/overlaps', count: unresolvedOverlapsCount },
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      ],
    },
    {
      label: 'Operations',
      items: [
<<<<<<< HEAD
        { name: 'nav.workflow', to: '/workflow', icon: GitBranch },
        { name: 'nav.import', to: '/import', icon: UploadCloud },
        { name: 'nav.dataQuality', to: '/data-quality', icon: ShieldCheck },
      ],
    },
    {
      label: 'Insights & Admin',
      items: [
        { name: 'nav.reports', to: '/reports', icon: BarChart3 },
        { name: 'nav.settings', to: '/settings', icon: Sliders },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen shrink-0 sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 flex items-center justify-center text-white shadow-xs font-bold text-sm tracking-wider">
            <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">AI</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-sm text-slate-900 tracking-tight">AICTE</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">Portal</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">Complaint Monitoring</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {group.label}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span className="truncate">{t(item.name)}</span>
                      </div>
                      {typeof item.count === 'number' && item.count > 0 ? (
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.countTone === 'bad'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          }`}
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              );
            })}
=======
        { name: 'nav.workflow', to: '/workflow' },
        { name: 'nav.import', to: '/import' },
        { name: 'nav.dataQuality', to: '/data-quality' },
      ],
    },
    { label: 'Insights', items: [{ name: 'nav.reports', to: '/reports' }] },
    { label: 'Administration', items: [{ name: 'nav.settings', to: '/settings' }] },
  ];

  return (
    <aside className="w-60 bg-white border-r border-line flex flex-col h-screen shrink-0 sticky top-0 z-30">
      <div className="h-14 px-4 border-b border-line flex flex-col justify-center">
        <div className="text-[13px] font-semibold text-brand leading-tight">AICTE</div>
        <p className="text-[12px] text-muted leading-tight">Complaint Monitoring System</p>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mt-4 mb-1 text-[11px] uppercase text-muted">{group.label}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-2 px-3 h-9 text-[13px] rounded-sm border-l-[3px] ${
                    isActive
                      ? 'bg-brand-soft text-brand font-medium border-brand'
                      : 'text-ink border-transparent hover:bg-page'
                  }`
                }
              >
                <span className="truncate">{t(item.name)}</span>
                {item.count ? (
                  <span className="text-[12px] text-muted tabular-nums text-right">{item.count}</span>
                ) : null}
              </NavLink>
            ))}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          </div>
        ))}
      </nav>

<<<<<<< HEAD
      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between text-slate-500 text-[11px]">
          <span>SIH26264 · v2.0</span>
          <Link to="/design-system" className="hover:text-blue-600 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-amber-500" /> System
          </Link>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
          <span>·</span>
          <Link to="/track" className="hover:text-slate-600 transition-colors">Tracker</Link>
        </div>
=======
      <div className="px-4 py-3 border-t border-line flex flex-col gap-1 text-[12px] text-muted">
        <Link to="/terms" className="hover:text-ink">Terms of Use</Link>
        <Link to="/privacy" className="hover:text-ink">Privacy Notice</Link>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      </div>
    </aside>
  );
};
<<<<<<< HEAD

export default Sidebar;
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

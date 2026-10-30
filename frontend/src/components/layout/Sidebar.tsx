import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { TKey, useT } from '../../i18n';

interface SidebarProps {
  unresolvedOverlapsCount?: number;
  overdueCasesCount?: number;
}

interface NavEntry {
  name: TKey;
  to: string;
  count?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  unresolvedOverlapsCount = 0,
  overdueCasesCount = 0
}) => {
  const { t } = useT();
  const groups: { label: string; items: NavEntry[] }[] = [
    {
      label: 'Monitoring',
      items: [
        { name: 'nav.overview', to: '/' },
        { name: 'nav.institutions', to: '/institutions' },
        { name: 'nav.allCases', to: '/cases', count: overdueCasesCount },
        { name: 'nav.overlapAlerts', to: '/overlaps', count: unresolvedOverlapsCount },
      ],
    },
    {
      label: 'Operations',
      items: [
        { name: 'nav.workflow', to: '/workflow' },
        { name: 'nav.import', to: '/import' },
        { name: 'nav.dataQuality', to: '/data-quality' },
      ],
    },
    { label: 'Insights', items: [{ name: 'nav.reports', to: '/reports' }] },
    { label: 'Administration', items: [{ name: 'nav.settings', to: '/settings' }] },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-screen shrink-0 sticky top-0 z-30">
      <div className="px-4 h-14 border-b border-border flex flex-col justify-center">
        <div className="text-lg font-bold text-brand leading-tight">AICTE</div>
        <p className="text-xs text-muted leading-tight">Complaint Monitoring System</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="px-4 pb-1 text-xs font-medium text-muted">{group.label}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between py-2 pr-4 pl-[13px] border-l-[3px] text-sm ${
                    isActive
                      ? 'border-brand bg-brand-soft text-brand font-medium'
                      : 'border-transparent text-ink hover:bg-page'
                  }`
                }
              >
                <span>{t(item.name)}</span>
                {item.count ? <span className="text-xs text-muted tabular-nums">{item.count}</span> : null}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-border text-xs text-muted flex items-center gap-2">
        <a href="#help" className="hover:underline">Help</a>
        <span>·</span>
        <Link to="/terms" className="hover:underline">Terms of Use</Link>
        <span>·</span>
        <Link to="/privacy" className="hover:underline">Privacy</Link>
      </div>
    </aside>
  );
};

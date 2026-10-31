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
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-line flex flex-col gap-1 text-[12px] text-muted">
        <Link to="/terms" className="hover:text-ink">Terms of Use</Link>
        <Link to="/privacy" className="hover:text-ink">Privacy Notice</Link>
      </div>
    </aside>
  );
};

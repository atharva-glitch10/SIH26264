import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FileText,
  AlertTriangle,
  GitBranch,
  BarChart3,
  ShieldCheck,
  Settings,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  unresolvedOverlapsCount?: number;
  overdueCasesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  unresolvedOverlapsCount = 0,
  overdueCasesCount = 0
}) => {
  const navItems = [
    { name: 'Overview', to: '/', icon: LayoutDashboard },
    { name: 'Institutions', to: '/institutions', icon: Building2 },
    {
      name: 'All Cases',
      to: '/cases',
      icon: FileText,
      badge: overdueCasesCount > 0 ? `${overdueCasesCount} overdue` : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      name: 'Overlap Alerts',
      to: '/overlaps',
      icon: AlertTriangle,
      badge: unresolvedOverlapsCount > 0 ? `${unresolvedOverlapsCount}` : undefined,
      badgeColor: 'bg-amber-500 text-white animate-pulse'
    },
    { name: 'Workflow & Transfers', to: '/workflow', icon: GitBranch },
    { name: 'Reports & Analytics', to: '/reports', icon: BarChart3 },
    { name: 'Data Quality & Review', to: '/data-quality', icon: ShieldCheck },
    { name: 'Settings & Rules', to: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen border-r border-slate-800 shrink-0 sticky top-0 z-30">
      {/* Branding Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3 bg-gradient-to-r from-slate-950 to-slate-900">
        <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg shadow-inner">
          AI
        </div>
        <div>
          <div className="font-semibold text-sm tracking-wide text-white uppercase flex items-center gap-1.5">
            AICTE
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-medium border border-teal-500/30">
              SIH26264
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal">Grievance & Regulation Portal</p>
        </div>
      </div>

      {/* Navigation links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Central Dashboard
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/50'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Inter-Bureau Quick Reference */}
      <div className="p-3 mx-3 mb-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
        <div className="font-medium text-slate-300 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
          Connected Bureaus
        </div>
        <div className="grid grid-cols-2 gap-1 text-[10px]">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">RB (Regulation)</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">PGRC (Grievance)</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">APPROVAL (Intake)</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">VIGILANCE (Ethics)</span>
        </div>
      </div>

      {/* Footer / Version */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between bg-slate-950">
        <span>AICTE Smart Prototype</span>
        <span className="font-mono text-teal-400">v1.0.0</span>
      </div>
    </aside>
  );
};

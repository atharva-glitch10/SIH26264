import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { api } from '../../services/api';
import { DashboardSummary } from '../../types';

export const Layout: React.FC = () => {
  const [currentRole, setCurrentRole] = useState('USR-SUPER-01');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSummary = async () => {
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (e) {
      console.error('Failed to load dashboard summary', e);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        unresolvedOverlapsCount={summary?.unresolved_overlap_alerts}
        overdueCasesCount={summary?.overdue_cases}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentRole={currentRole} onRoleChange={setCurrentRole} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet context={{ currentRole, refreshSummary: fetchSummary }} />
        </main>
      </div>
    </div>
  );
};

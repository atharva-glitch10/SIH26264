import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { api } from '../../services/api';
import { DashboardSummary } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Footer } from './Footer';
import { TermsAcceptanceModal } from '../legal/TermsAcceptanceModal';

export const Layout: React.FC = () => {
  const { user } = useAuth();
  // Pages pass this as actor_user_id; the backend now always uses the signed-in officer from the token.
  const currentRole = user?.user_id || '';
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
    <div className="flex min-h-screen bg-page">
      <Sidebar
        unresolvedOverlapsCount={summary?.unresolved_overlap_alerts}
        overdueCasesCount={summary?.overdue_cases}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet context={{ currentRole, currentUser: user, refreshSummary: fetchSummary }} />
        </main>
        <Footer />
      </div>
      <TermsAcceptanceModal />
    </div>
  );
};

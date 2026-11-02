import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Layout } from './components/layout/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Overview } from './pages/Overview';
import { Institutions } from './pages/Institutions';
import { Institution360 } from './pages/Institution360';
import { Cases } from './pages/Cases';
import { CaseDetails } from './pages/CaseDetails';
import { OverlapAlerts } from './pages/OverlapAlerts';
import { Workflow } from './pages/Workflow';
import { Reports } from './pages/Reports';
import { DataQuality } from './pages/DataQuality';
import { SettingsPage } from './pages/Settings';
import { ImportData } from './pages/ImportData';
import { Login } from './pages/Login';
import { TrackComplaint } from './pages/TrackComplaint';
import { NotFound } from './pages/NotFound';
import { DesignSystem } from './pages/DesignSystem';
import { ToastProvider } from './components/ui/Toast';
import { TermsOfUse } from './pages/legal/TermsOfUse';
import { PrivacyNotice } from './pages/legal/PrivacyNotice';

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm gap-2">
        <Clock className="w-4 h-4 animate-spin text-teal-600" /> Checking session…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/track" element={<TrackComplaint />} />
          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/privacy" element={<PrivacyNotice />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Overview />} />
            <Route path="institutions" element={<Institutions />} />
            <Route path="institutions/:id" element={<Institution360 />} />
            <Route path="cases" element={<Cases />} />
            <Route path="cases/:id" element={<CaseDetails />} />
            <Route path="overlaps" element={<OverlapAlerts />} />
            <Route path="workflow" element={<Workflow />} />
            <Route path="import" element={<ImportData />} />
            <Route path="reports" element={<Reports />} />
            <Route path="data-quality" element={<DataQuality />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
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
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="institutions" element={<Institutions />} />
          <Route path="institutions/:id" element={<Institution360 />} />
          <Route path="cases" element={<Cases />} />
          <Route path="cases/:id" element={<CaseDetails />} />
          <Route path="overlaps" element={<OverlapAlerts />} />
          <Route path="workflow" element={<Workflow />} />
          <Route path="reports" element={<Reports />} />
          <Route path="data-quality" element={<DataQuality />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

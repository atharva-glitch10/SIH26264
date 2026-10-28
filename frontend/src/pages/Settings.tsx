import React from 'react';
import { Settings as SettingsIcon, Shield, Sliders, Layers, Clock, AlertTriangle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Engine Rules</h1>
        <p className="text-xs text-slate-500 mt-1">
          Active configuration governing SLA thresholds, workflow state machine transitions, and cross-bureau overlap detection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workflow State Machine Rules */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Sliders className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Workflow State Transitions</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-mono text-[11px]">
              <div><strong>RECEIVED</strong> → PENDING, UNDER_PROCESS, TRANSFERRED</div>
              <div><strong>PENDING</strong> → UNDER_PROCESS, TRANSFERRED, ESCALATED</div>
              <div><strong>UNDER_PROCESS</strong> → TRANSFERRED, ESCALATED, DISPOSED</div>
              <div><strong>TRANSFERRED</strong> → PENDING, UNDER_PROCESS, ESCALATED</div>
              <div><strong>ESCALATED</strong> → UNDER_PROCESS, DISPOSED</div>
              <div><strong>DISPOSED</strong> → CLOSED, UNDER_PROCESS (Reopen)</div>
            </div>
            <p className="text-slate-500 text-[11px]">
              Transitions are validated on the backend API. Arbitrary status modifications without action records are rejected.
            </p>
          </div>
        </div>

        {/* SLA & Deadline Engine Rules */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">SLA Resolution Windows</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-rose-50 text-rose-800 border border-rose-200">
                <strong>URGENT:</strong> 15 Days
              </div>
              <div className="p-2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                <strong>HIGH:</strong> 30 Days
              </div>
              <div className="p-2 rounded bg-slate-100 text-slate-800 border border-slate-200">
                <strong>MEDIUM:</strong> 45 Days
              </div>
              <div className="p-2 rounded bg-slate-100 text-slate-800 border border-slate-200">
                <strong>LOW:</strong> 60 Days
              </div>
            </div>
            <p className="text-slate-500 text-[11px]">
              Approaching deadline warnings fire within 7 days and 3 days of target disposal date.
            </p>
          </div>
        </div>

        {/* Overlap Detection Rules */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <AlertTriangle className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Overlap Engine Triggers</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
              <div><strong>Rule A:</strong> ≥ 2 active cases on same institution across ≥ 2 Bureaus (MEDIUM)</div>
              <div><strong>Rule B:</strong> Same institution with overlapping category clusters (HIGH)</div>
              <div><strong>Rule C:</strong> RapidFuzz token similarity ≥ 75% on descriptions (CRITICAL)</div>
            </div>
          </div>
        </div>

        {/* Institution Matching Thresholds */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Matching Safety Margins</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
              <div><strong>AICTE Permanent ID Match:</strong> 100% Direct Link</div>
              <div><strong>Canonical Exact Match:</strong> 100% Direct Link</div>
              <div><strong>Score ≥ 90%:</strong> Auto-match IF top gap &gt; 10%</div>
              <div><strong>Score 75 - 89%:</strong> Routed to Manual Verification Queue</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

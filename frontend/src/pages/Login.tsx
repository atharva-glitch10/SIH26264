import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { Shield, CheckCircle2, ArrowRight, Sparkles, Building, Lock, User as UserIcon } from 'lucide-react';
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
import { api } from '../services/api';
import { roleLabel, useAuth } from '../context/AuthContext';
import { DemoAccount } from '../types';
import { useT } from '../i18n';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
<<<<<<< HEAD
=======
import { Table, THead, Th, Td, Tr } from '../components/ui/Table';

const inputClass = 'mt-1 w-full h-9 px-3 text-[13px] bg-white border border-line rounded-sm text-ink placeholder:text-muted';
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

export const Login: React.FC = () => {
  const { user, login } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState<{ demo_password: string; accounts: DemoAccount[] } | null>(null);

  useEffect(() => {
    api.getDemoAccounts().then(setDemo).catch(() => setDemo(null));
  }, []);

  if (user) {
    const target = (location.state as { from?: string } | null)?.from || '/';
    return <Navigate to={target} replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate((location.state as { from?: string } | null)?.from || '/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || t('login.failed'));
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (acc: DemoAccount) => {
    setUsername(acc.user_id);
    if (demo) setPassword(demo.demo_password);
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans">
      {/* Left Prestige Hero Panel */}
      <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-[#0d1c3e] to-slate-950 text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Top Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 border border-blue-400/30 flex items-center justify-center shadow-lg">
              <Building className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-widest uppercase text-amber-400/90">Government of India</p>
              <p className="text-xs font-medium text-slate-300">All India Council for Technical Education</p>
            </div>
          </div>

          <div className="mt-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-blue-200 mb-4 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> SIH26264 Integrated Gateway
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold font-heading tracking-tight text-white leading-tight">
              Institution Complaint Monitoring System
            </h1>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-md">
              A unified single-window portal providing complete 360° institutional oversight, automated inter-bureau overlap detection, and strict SLA enforcement across AICTE bureaus.
            </p>
          </div>

          {/* Key Value Cards */}
          <div className="mt-8 space-y-3 max-w-md">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Cross-Bureau Synchronization</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Real-time overlap alerts across Regulation Bureau (RB), PGRC, Approval, and Vigilance.</p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Automated SLA Monitoring</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Continuous escalation engine ensuring strict citizen grievance turnaround deadlines.</p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Role-Based Secure Audit Trail</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tamper-evident activity logs for Super Admins, Bureau Officers, and Regional Heads.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="relative z-10 pt-8 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/10 mt-8">
          <span>AICTE Enterprise Governance</span>
          <span>Security Level: RESTRICTED</span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <Card className="p-8 sm:p-10 border-slate-200/90 shadow-xl rounded-2xl bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">{t('login.title')}</h2>
                <p className="text-xs text-slate-500 mt-1">{t('login.subtitle')}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Lock className="w-5 h-5 text-slate-600" />
              </div>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('login.username')}
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-xs"
                    placeholder="e.g. USR-RB-01"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('login.password')}
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-xs"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    I agree to the <Link to="/terms" className="font-medium text-blue-600 hover:underline">Terms of Use</Link> and{' '}
                    <Link to="/privacy" className="font-medium text-blue-600 hover:underline">Privacy Notice</Link>
                  </span>
                </label>
              </div>

              {error && (
                <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-lg p-3 font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={busy || !agreed}
                className="w-full h-10 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm"
              >
                {busy ? t('login.submitting') : t('login.submit')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            <div className="mt-5 text-xs text-slate-500 text-center">
              {t('login.complainant')}{' '}
              <Link to="/track" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                {t('login.track')}
              </Link>
            </div>

            {/* Quick Demo Access Section */}
            {demo && demo.accounts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Demo Accounts (Instant Testing)</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    PWD: {demo.demo_password}
                  </span>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {demo.accounts.map((acc) => (
                    <div
                      key={acc.user_id}
                      className="p-2.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-white flex items-center justify-between gap-3 transition-all duration-150"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 truncate">{acc.display_name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/60 text-slate-700 shrink-0">
                            {acc.user_id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {roleLabel(acc.role)}
                          {acc.bureau_id ? ` · ${acc.bureau_id.replace('BUR-', '')}` : ''}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fillDemo(acc)}
                        className="shrink-0 h-7 text-xs font-medium px-2.5 bg-white hover:bg-slate-50"
                      >
                        Use
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
=======
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-page">
      <div className="bg-brand text-white p-10 flex flex-col justify-center">
        <p className="text-[13px] opacity-80">All India Council for Technical Education</p>
        <h1 className="mt-2 text-2xl font-semibold">Institution Complaint Monitoring System</h1>
        <p className="mt-4 max-w-md text-[13px] leading-relaxed opacity-80">
          A single view of every complaint about an institution, whichever Bureau or Cell received it,
          with deadlines and ownership recorded in one place.
        </p>
        <ul className="mt-6 space-y-2 text-[13px] opacity-80 list-disc pl-5 max-w-md">
          <li>Single view of complaints across RB, PGRC and other cells</li>
          <li>Role-based access with full audit trail</li>
          <li>Automatic institution linking and duplicate checks</li>
        </ul>
      </div>

      <div className="p-6 md:p-10 flex items-center">
        <Card className="w-full max-w-md p-6 mx-auto">
          <h2 className="text-xl font-semibold text-ink">{t('login.title')}</h2>
          <p className="text-[13px] text-muted mt-1">{t('login.subtitle')}</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-[13px] font-medium text-ink">{t('login.username')}</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                placeholder="e.g. USR-RB-01"
                autoComplete="username"
                required
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-medium text-ink">{t('login.password')}</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                autoComplete="current-password"
                required
              />
            </label>
            <label className="flex items-start gap-2 text-[13px] text-ink">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I agree to the <Link to="/terms" className="underline">Terms of Use</Link> and{' '}
                <Link to="/privacy" className="underline">Privacy Notice</Link>
              </span>
            </label>
            {error && (
              <div className="text-[13px] text-bad bg-bad/5 border border-bad/30 rounded-sm p-2">{error}</div>
            )}
            <Button type="submit" disabled={busy || !agreed} className="w-full">
              {busy ? t('login.submitting') : t('login.submit')}
            </Button>
          </form>

          <div className="mt-4 text-[13px] text-muted text-center">
            {t('login.complainant')}{' '}
            <Link to="/track" className="font-medium hover:underline">{t('login.track')}</Link>
          </div>

          {demo && demo.accounts.length > 0 && (
            <div className="mt-6 border-t border-line pt-4">
              <p className="text-[12px] text-muted">
                Demo password (synthetic data){' '}
                <span className="font-mono text-ink">{demo.demo_password}</span>
              </p>
              <div className="mt-2 max-h-48 overflow-y-auto border border-line rounded-sm">
                <Table>
                  <THead>
                    <tr>
                      <Th>Officer</Th>
                      <Th>Role</Th>
                      <Th>Bureau</Th>
                      <Th><span className="sr-only">Use</span></Th>
                    </tr>
                  </THead>
                  <tbody>
                    {demo.accounts.map((acc) => (
                      <Tr key={acc.user_id}>
                        <Td className="py-1.5">{acc.display_name}</Td>
                        <Td className="py-1.5 text-muted">{roleLabel(acc.role)}</Td>
                        <Td className="py-1.5 text-muted">{acc.bureau_id ? acc.bureau_id.replace('BUR-', '') : '—'}</Td>
                        <Td className="py-1.5">
                          <Button type="button" variant="ghost" size="sm" onClick={() => fillDemo(acc)}>
                            Use
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Card>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      </div>
    </div>
  );
};
<<<<<<< HEAD

export default Login;
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

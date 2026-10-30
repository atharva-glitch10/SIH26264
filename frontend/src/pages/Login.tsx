import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { roleLabel, useAuth } from '../context/AuthContext';
import { DemoAccount } from '../types';
import { useT } from '../i18n';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Table, Th, Td, Tr } from '../components/ui/DataTable';

const inputClass = 'mt-1 w-full h-9 px-3 text-sm bg-surface border border-border rounded-sm text-ink';

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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-page">
      <div className="bg-brand text-white p-10 lg:p-16 flex flex-col justify-center">
        <p className="text-sm text-white/80">All India Council for Technical Education</p>
        <h1 className="mt-2 text-2xl font-semibold">Complaint Monitoring System</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90">
          A single view of every complaint about an institution, whichever Bureau or Cell received it.
        </p>
        <ul className="mt-8 space-y-2 text-sm text-white/90 list-disc pl-5 max-w-md">
          <li>Complaints are linked to institutions and checked for duplicates and overlaps.</li>
          <li>Service-level deadlines are tracked, with alerts for overdue cases.</li>
          <li>Access is role-based and every action is recorded in an audit log.</li>
        </ul>
      </div>

      <div className="p-6 lg:p-16 flex items-center">
        <Card className="w-full max-w-md p-6 mx-auto">
          <h2 className="text-xl font-semibold text-ink">{t('login.title')}</h2>
          <p className="text-sm text-muted mt-1">{t('login.subtitle')}</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-ink">{t('login.username')}</span>
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
              <span className="text-sm font-medium text-ink">{t('login.password')}</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                autoComplete="current-password"
                required
              />
            </label>
            <label className="flex items-start gap-2 text-sm text-ink">
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
              <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-sm p-2">{error}</div>
            )}
            <Button type="submit" disabled={busy || !agreed} className="w-full">
              {busy ? t('login.submitting') : t('login.submit')}
            </Button>
          </form>

          <div className="mt-4 text-sm text-muted text-center">
            {t('login.complainant')}{' '}
            <Link to="/track" className="font-medium hover:underline">{t('login.track')}</Link>
          </div>

          {demo && demo.accounts.length > 0 && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-xs text-muted">
                Demo officers (synthetic data) · password{' '}
                <span className="font-mono text-ink">{demo.demo_password}</span>
              </p>
              <div className="mt-2 max-h-48 overflow-y-auto border border-border rounded-sm">
                <Table>
                  <thead>
                    <tr>
                      <Th className="px-3">Officer</Th>
                      <Th className="px-3">Role</Th>
                      <Th className="px-3">Bureau</Th>
                      <Th className="px-3"><span className="sr-only">Use</span></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {demo.accounts.map((acc) => (
                      <Tr key={acc.user_id}>
                        <Td className="px-3 py-1.5">{acc.display_name}</Td>
                        <Td className="px-3 py-1.5 text-muted">{roleLabel(acc.role)}</Td>
                        <Td className="px-3 py-1.5 text-muted">{acc.bureau_id ? acc.bureau_id.replace('BUR-', '') : '—'}</Td>
                        <Td className="px-3 py-1.5">
                          <button
                            type="button"
                            onClick={() => fillDemo(acc)}
                            className="text-brand-accent hover:underline"
                          >
                            Use
                          </button>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

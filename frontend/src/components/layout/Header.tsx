import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { Bell, ChevronDown, Search, Globe, LogOut, X, Sparkles } from 'lucide-react';
=======
import { Bell, ChevronDown, X } from 'lucide-react';
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import { roleLabel, useAuth } from '../../context/AuthContext';
import { setLang, useT } from '../../i18n';
import Tag, { TagTone } from '../ui/Tag';

const ALERT_TONE: Record<string, TagTone> = {
  OVERLAP_DETECTED: 'warning',
  DUPLICATE_SUSPECTED: 'info',
  TRANSFER_RECEIVED: 'info',
  TRANSFER_UNACKNOWLEDGED: 'danger',
  ESCALATION: 'danger',
};

const referenceLink = (n: NotificationItem): string | null => {
  if (!n.reference_id) return null;
  if (n.reference_id.startsWith('OVR-')) return '/overlaps';
  if (n.reference_id.startsWith('CASE-')) return `/cases/${n.reference_id}`;
  return null;
};

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications({ limit: 8 });
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cases?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

<<<<<<< HEAD
  const unreadCount = notifications.filter((n) => !n.read_at).length;
=======
  const unreadCount = notifications.filter(n => !n.read_at).length;
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

  const markAsRead = async (n: NotificationItem) => {
    try {
      if (!n.read_at) {
        await api.markNotificationRead(n.notification_id);
<<<<<<< HEAD
        setNotifications((prev) =>
          prev.map((x) =>
            x.notification_id === n.notification_id ? { ...x, read_at: new Date().toISOString() } : x
          )
=======
        setNotifications(prev =>
          prev.map(x => (x.notification_id === n.notification_id ? { ...x, read_at: new Date().toISOString() } : x))
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
        );
      }
      const link = referenceLink(n);
      if (link) {
        setShowNotifications(false);
        navigate(link);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const bureau = user?.bureau_id ? user.bureau_id.replace('BUR-', '') : '';

<<<<<<< HEAD
  // Get user initials for avatar
  const initials = user?.display_name
    ? user.display_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'OF';

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="h-16 px-6 flex items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case reference, institution or Permanent ID..."
              className="h-9 w-full pl-9 pr-14 text-[13px] bg-slate-50/80 border border-slate-200/90 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-xs"
            />
            <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs pointer-events-none">
              Ctrl+K
            </kbd>
          </div>
        </form>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* Demo Mode Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Synthetic Demo Mode</span>
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            title={t('header.language')}
            className="h-9 px-3 rounded-lg border border-slate-200/90 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
=======
  return (
    <header className="sticky top-0 z-20">
      <div className="text-[12px] text-muted bg-page border-b border-line px-5 py-1">
        Demonstration environment · synthetic data
      </div>

      <div className="h-14 px-5 bg-white border-b border-line flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-[420px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search case reference, institution or Permanent ID"
            className="h-9 w-full border border-line rounded-sm px-3 text-[13px] bg-white text-ink placeholder:text-muted"
          />
        </form>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            title={t('header.language')}
            className="h-8 px-3 rounded-sm border border-line text-[13px] text-ink hover:bg-page"
          >
            {lang === 'en' ? 'हिन्दी' : 'English'}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
<<<<<<< HEAD
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="h-9 w-9 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors relative shadow-xs"
              title={t('header.alertsTitle')}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-88 bg-white border border-slate-200/90 rounded-2xl shadow-dropdown z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-semibold text-slate-900">{t('header.notifications')}</span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">{t('header.noAlerts')}</div>
=======
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
              className="h-8 px-2 flex items-center gap-1.5 rounded-sm text-muted hover:bg-page"
              title={t('header.alertsTitle')}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && <span className="text-[12px] text-muted tabular-nums">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-line rounded-md shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-line flex items-center justify-between text-[13px] font-semibold text-ink">
                  <span>{t('header.notifications')}</span>
                  <button onClick={() => setShowNotifications(false)} className="text-muted hover:text-ink">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-line">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-[13px] text-muted">{t('header.noAlerts')}</div>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.notification_id}
<<<<<<< HEAD
                        className={`p-3.5 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                          !n.read_at ? 'bg-blue-50/40' : ''
                        }`}
                        onClick={() => markAsRead(n)}
                      >
                        <p className={`text-slate-900 leading-snug ${!n.read_at ? 'font-semibold' : 'font-normal'}`}>
                          {n.message.replace(/^\[[A-Z0-9-]+\]\s*/, '')}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
=======
                        className={`p-3 text-[13px] hover:bg-page cursor-pointer ${!n.read_at ? 'bg-brand-soft' : ''}`}
                        onClick={() => markAsRead(n)}
                      >
                        <p className={`text-ink leading-snug ${!n.read_at ? 'font-medium' : ''}`}>
                          {n.message.replace(/^\[[A-Z0-9-]+\]\s*/, '')}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-[12px] text-muted">
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                          <Tag tone={ALERT_TONE[n.alert_type] ?? 'neutral'}>
                            {n.alert_type.replace(/_/g, ' ').toLowerCase()}
                          </Tag>
                          <span>
<<<<<<< HEAD
                            {new Date(n.created_at).toLocaleString([], {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
=======
                            {new Date(n.created_at).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

<<<<<<< HEAD
          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="h-10 pl-2 pr-3 flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-900 to-indigo-950 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {initials}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <span className="block text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                  {user?.display_name}
                </span>
                <span className="block text-[11px] text-slate-500">
                  {roleLabel(user?.role)}
                  {bureau ? ` · ${bureau}` : ''}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200/90 rounded-2xl shadow-dropdown z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 sm:hidden">
                  <p className="text-xs font-semibold text-slate-900">{user?.display_name}</p>
                  <p className="text-[11px] text-slate-500">{roleLabel(user?.role)}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
=======
          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              className="h-10 px-2 flex items-center gap-2 rounded-sm hover:bg-page text-left"
            >
              <span className="leading-tight">
                <span className="block text-[13px] font-medium text-ink">{user?.display_name}</span>
                <span className="block text-[12px] text-muted">
                  {roleLabel(user?.role)}{bureau ? ` · ${bureau}` : ''}
                </span>
              </span>
              <ChevronDown className="w-4 h-4 text-muted" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-line rounded-md shadow-lg z-50 py-1">
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-[13px] text-ink hover:bg-page"
                >
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
                  {t('header.signOut')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
<<<<<<< HEAD

export default Header;
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, X } from 'lucide-react';
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

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const markAsRead = async (n: NotificationItem) => {
    try {
      if (!n.read_at) {
        await api.markNotificationRead(n.notification_id);
        setNotifications(prev =>
          prev.map(x => (x.notification_id === n.notification_id ? { ...x, read_at: new Date().toISOString() } : x))
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

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-20">
      <div className="bg-brand-soft border-b border-border px-6 py-1 text-xs text-brand">
        Demonstration environment · synthetic data
      </div>

      <div className="h-14 px-6 flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('header.searchPlaceholder')}
            className="w-full h-9 pl-9 pr-3 text-sm bg-surface border border-border rounded-sm text-ink placeholder:text-muted"
          />
        </form>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            title={t('header.language')}
            className="h-8 px-3 rounded-sm border border-border text-sm text-ink hover:bg-page"
          >
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
              className="h-8 px-2 flex items-center gap-1.5 rounded-sm text-muted hover:bg-page"
              title={t('header.alertsTitle')}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && <span className="text-xs font-medium text-danger tabular-nums">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-md shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex items-center justify-between text-sm font-semibold text-ink">
                  <span>{t('header.notifications')}</span>
                  <button onClick={() => setShowNotifications(false)} className="text-muted hover:text-ink">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted">{t('header.noAlerts')}</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.notification_id}
                        className={`p-3 text-sm hover:bg-page cursor-pointer ${!n.read_at ? 'bg-brand-soft' : ''}`}
                        onClick={() => markAsRead(n)}
                      >
                        <p className={`text-ink leading-snug ${!n.read_at ? 'font-medium' : ''}`}>
                          {n.message.replace(/^\[[A-Z0-9-]+\]\s*/, '')}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                          <Tag tone={ALERT_TONE[n.alert_type] ?? 'neutral'}>
                            {n.alert_type.replace(/_/g, ' ').toLowerCase()}
                          </Tag>
                          <span>
                            {new Date(n.created_at).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              className="h-10 px-2 flex items-center gap-2 rounded-sm hover:bg-page text-left"
            >
              <span className="leading-tight">
                <span className="block text-sm font-medium text-ink">{user?.display_name}</span>
                <span className="block text-xs text-muted">
                  {roleLabel(user?.role)}{bureau ? ` · ${bureau}` : ''}
                </span>
              </span>
              <ChevronDown className="w-4 h-4 text-muted" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-surface border border-border rounded-md shadow-lg z-50 py-1">
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-sm text-ink hover:bg-page"
                >
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

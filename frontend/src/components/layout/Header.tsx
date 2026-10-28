import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Shield,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';

interface HeaderProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const markAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.notification_id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      {/* Top Demo Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1 text-center text-xs font-medium text-amber-800 flex items-center justify-center gap-2">
        <Shield className="w-3.5 h-3.5 text-amber-600" />
        <span>
          <strong>DEMONSTRATION PROTOTYPE (SIH26264):</strong> Operating in local sandbox with synthetic data. Not connected to official AICTE live databases.
        </span>
      </div>

      <div className="px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Global Quick Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search institution, AICTE Permanent ID, case ref (e.g. INST-1001 or Alpha)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
          />
        </form>

        {/* Right Action Tools: Role Switcher & Notifications */}
        <div className="flex items-center gap-3">
          {/* Simulated Demo Persona Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-slate-500 font-medium">Demo Persona:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="USR-SUPER-01">Senior Management (Dr. A.K. Sharma)</option>
              <option value="USR-RB-01">Regulation Bureau Officer (Shri R. Verma)</option>
              <option value="USR-PGRC-01">Grievance Cell Officer (Dr. M. Sundaram)</option>
            </select>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative transition-colors focus:outline-none"
              title="System Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
                  <span>System Notifications & Warnings</span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No active alerts.</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.notification_id}
                        className={`p-3 text-xs flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                          !n.read_at ? 'bg-amber-50/40 font-medium' : ''
                        }`}
                        onClick={() => markAsRead(n.notification_id)}
                      >
                        {n.alert_type === 'OVERLAP_DETECTED' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-slate-800 leading-snug">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

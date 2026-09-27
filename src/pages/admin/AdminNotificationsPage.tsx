import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, ShoppingBag, AlertTriangle, UserPlus, Star } from 'lucide-react';
import { NotificationItem } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface AdminNotificationsPageProps {
  onNavigate: (route: string) => void;
}

export const AdminNotificationsPage: React.FC<AdminNotificationsPageProps> = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch {
      setError(t('admin.state.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      showToast(t('admin.notifications.markAllRead'), 'success');
      loadData();
    } catch {
      showToast(t('admin.state.error'), 'error');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      loadData();
    } catch {
      showToast(t('admin.state.error'), 'error');
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-5 h-5 text-cyan-400" />;
      case 'low_stock':
      case 'out_of_stock':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'customer':
        return <UserPlus className="w-5 h-5 text-emerald-400" />;
      case 'review':
        return <Star className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTypeLabel = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return t('admin.notifications.newOrder');
      case 'low_stock':
        return t('admin.notifications.lowStock');
      case 'out_of_stock':
        return t('admin.notifications.outOfStock');
      case 'customer':
        return t('admin.notifications.newCustomer');
      case 'review':
        return t('admin.notifications.newReview');
      default:
        return t('admin.notifications.title');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            {t('admin.notifications.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t('admin.notifications.subtitle')}</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition-all"
        >
          <CheckCheck className="w-4 h-4 text-cyan-400" /> {t('admin.notifications.markAllRead')}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-rose-400 text-sm">
          <span>{error}</span>
          <button
            onClick={loadData}
            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-bold text-xs"
          >
            {t('admin.state.tryAgain')}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-[#0d0f17] rounded-2xl border border-white/10">
            {t('admin.state.loading')}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-[#0d0f17] rounded-2xl border border-white/10">
            {t('admin.state.noData')}
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkRead(n.id)}
              className={`p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                n.read
                  ? 'bg-[#0d0f17] border-white/5 opacity-70'
                  : 'bg-[#0d0f17] border-cyan-500/30 shadow-lg shadow-cyan-500/5'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      {getTypeLabel(n.type)}
                    </span>
                    <span className="text-slate-600">•</span>
                    <h3 className="text-sm font-bold text-white">{n.title}</h3>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-cyan-500" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              {!n.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(n.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[11px] font-bold shrink-0"
                >
                  {t('admin.notifications.markRead')}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

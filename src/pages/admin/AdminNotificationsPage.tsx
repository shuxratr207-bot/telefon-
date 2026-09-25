import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, CheckCircle2, AlertTriangle, Star, UserPlus, ShoppingBag, ArrowRight } from 'lucide-react';
import { NotificationItem } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminNotificationsPageProps {
  onNavigate: (route: string) => void;
}

export const AdminNotificationsPage: React.FC<AdminNotificationsPageProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)));
      showToast('Marked as read', 'info');
    } catch (e) {
      showToast('Failed to update', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read', 'success');
    } catch (e) {
      showToast('Failed to update', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      showToast('Notification removed', 'info');
    } catch (e) {
      showToast('Failed to delete', 'error');
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-5 h-5 text-cyan-400" />;
      case 'low_stock':
      case 'out_of_stock':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'customer':
        return <UserPlus className="w-5 h-5 text-indigo-400" />;
      case 'review':
        return <Star className="w-5 h-5 text-amber-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            Operations &amp; Security Alerts
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated alerts triggered on incoming orders, warehouse stock thresholds, customer registrations, and review submissions.
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center bg-[#0d0f17] rounded-3xl border border-white/10 text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-white">No Unread Alerts</p>
            <p className="text-xs text-slate-500 mt-0.5">All order streams and warehouse inventory are clear.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                n.read
                  ? 'bg-[#0d0f17]/60 border-white/5 opacity-70 hover:opacity-100'
                  : 'bg-[#0d0f17] border-cyan-500/30 shadow-lg'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{n.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.link && (
                  <button
                    onClick={() => onNavigate(n.link!)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                {!n.read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-white/5"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

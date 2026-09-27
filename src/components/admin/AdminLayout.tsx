import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Smartphone,
  ShoppingBag,
  Users,
  UserCheck,
  Tag,
  Grid,
  Boxes,
  Flame,
  Star,
  Image as ImageIcon,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage, Language } from '../../context/LanguageContext.tsx';
import { api } from '../../services/api.ts';

interface AdminLayoutProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentRoute, onNavigate, children }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const languages: Language[] = ['UZ', 'RU', 'EN'];

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await api.getNotifications();
        const unread = res.notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch {}
    }
    loadNotifications();
  }, [currentRoute]);

  const menuItems = [
    { label: t('admin.sidebar.dashboard'), route: '/admin', icon: LayoutDashboard },
    { label: t('admin.sidebar.products'), route: '/admin/products', icon: Smartphone },
    { label: t('admin.sidebar.orders'), route: '/admin/orders', icon: ShoppingBag },
    { label: t('admin.sidebar.customers'), route: '/admin/customers', icon: Users },
    { label: t('admin.sidebar.users'), route: '/admin/users', icon: UserCheck },
    { label: t('admin.sidebar.brands'), route: '/admin/brands', icon: Tag },
    { label: t('admin.sidebar.categories'), route: '/admin/categories', icon: Grid },
    { label: t('admin.sidebar.inventory'), route: '/admin/inventory', icon: Boxes },
    { label: t('admin.sidebar.deals'), route: '/admin/deals', icon: Flame },
    { label: t('admin.sidebar.reviews'), route: '/admin/reviews', icon: Star },
    { label: t('admin.sidebar.banners'), route: '/admin/banners', icon: ImageIcon },
    { label: t('admin.sidebar.analytics'), route: '/admin/analytics', icon: BarChart3 },
    {
      label: t('admin.sidebar.notifications'),
      route: '/admin/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { label: t('admin.sidebar.settings'), route: '/admin/settings', icon: Settings },
  ];

  const activeItem = menuItems.find(item => item.route === currentRoute) || menuItems[0];

  const handleItemClick = (route: string) => {
    onNavigate(route);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px]">
              <div className="w-full h-full bg-[#0d0f17] rounded-[11px] flex items-center justify-center font-extrabold text-cyan-400 text-sm">
                N
              </div>
            </div>
            <div>
              <span className="font-extrabold text-white text-sm font-['Space_Grotesk'] tracking-wider">
                NOVA MOBILE
              </span>
              <span className="block text-[10px] text-cyan-400 uppercase tracking-widest font-semibold">
                {t('admin.sidebar.control')}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)] no-scrollbar">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => handleItemClick(item.route)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                      isActive ? 'bg-black text-cyan-400' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Exit */}
      <div className="p-4 border-t border-white/10 bg-black/40 space-y-2.5">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <div
            onClick={() => handleItemClick('/admin/settings')}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                {t('admin.sidebar.profile')}
              </p>
              <p className="text-xs font-bold text-white truncate">{user?.name || t('admin.users.roleAdmin')}</p>
              <p className="text-[10px] text-cyan-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              onNavigate('/admin/login');
            }}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1 text-xs font-semibold shrink-0"
            title={t('admin.sidebar.logout')}
          >
            <LogOut className="w-4 h-4" />
            <span className="sr-only">{t('admin.sidebar.logout')}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigate('/')}
            className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{t('admin.sidebar.liveStore')}</span>
          </button>

          <button
            onClick={() => {
              logout();
              onNavigate('/admin/login');
            }}
            className="py-2 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>{t('admin.sidebar.logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-[#0d0f17] border-r border-white/10 fixed inset-y-0 left-0 z-30">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-64 bg-[#0d0f17] border-r border-white/10 h-full z-10"
            >
              {SidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-white/10 bg-[#0d0f17]/85 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/10"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 truncate">
              <span className="hidden sm:inline">NOVA {t('admin.sidebar.control')}</span>
              <span className="hidden sm:inline text-slate-600">/</span>
              <span className="text-white font-bold truncate">{activeItem.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Admin Language Switcher: UZ | RU | EN */}
            <div
              className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5"
              role="group"
              aria-label="Admin Language Switcher"
            >
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold tracking-wider transition-all ${
                    language === lang
                      ? 'bg-cyan-500 text-black shadow-sm shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Notifications Button */}
            <button
              onClick={() => onNavigate('/admin/notifications')}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 border border-white/10 transition-colors"
              title={t('admin.sidebar.notifications')}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Quick Visit Customer Store */}
            <button
              onClick={() => onNavigate('/')}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span className="hidden sm:inline">{t('admin.sidebar.liveStore')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Admin Page Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1440px] w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

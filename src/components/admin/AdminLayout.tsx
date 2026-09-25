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
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { NotificationItem } from '../../types/index.ts';

interface AdminLayoutProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentRoute, onNavigate, children }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
    { label: 'Dashboard', route: '/admin', icon: LayoutDashboard },
    { label: 'Products', route: '/admin/products', icon: Smartphone },
    { label: 'Orders', route: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', route: '/admin/customers', icon: Users },
    { label: 'Users & Roles', route: '/admin/users', icon: UserCheck },
    { label: 'Brands', route: '/admin/brands', icon: Tag },
    { label: 'Categories', route: '/admin/categories', icon: Grid },
    { label: 'Inventory', route: '/admin/inventory', icon: Boxes },
    { label: 'Flash Deals', route: '/admin/deals', icon: Flame },
    { label: 'Reviews', route: '/admin/reviews', icon: Star },
    { label: 'Banners', route: '/admin/banners', icon: ImageIcon },
    { label: 'Analytics', route: '/admin/analytics', icon: BarChart3 },
    { label: 'Notifications', route: '/admin/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
    { label: 'Store Settings', route: '/admin/settings', icon: Settings },
  ];

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
                Control Studio
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] no-scrollbar">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => handleItemClick(item.route)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
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
      <div className="p-4 border-t border-white/10 bg-black/40 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-cyan-400 truncate">{user?.email || 'admin@novamobile.store'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              onNavigate('/admin/login');
            }}
            className="p-1.5 text-slate-500 hover:text-rose-400"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => onNavigate('/')}
          className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          <span>Exit to Customer Store</span>
        </button>
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
        <header className="h-16 border-b border-white/10 bg-[#0d0f17]/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/10"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="hidden sm:inline">NOVA Admin</span>
              <span className="hidden sm:inline text-slate-600">/</span>
              <span className="text-white capitalize">
                {currentRoute.replace('/admin/', '').replace('/admin', 'Dashboard') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Button */}
            <button
              onClick={() => onNavigate('/admin/notifications')}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 border border-white/10"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Quick Visit Customer Store */}
            <button
              onClick={() => onNavigate('/')}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 text-xs font-bold transition-all flex items-center gap-2"
            >
              <span className="hidden sm:inline">Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Admin Page Outlet */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

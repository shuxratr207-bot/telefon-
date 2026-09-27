import React, { useState, useEffect } from 'react';
import { ShieldCheck, User as UserIcon, Search } from 'lucide-react';
import { User } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface AdminUsersPageProps {
  onNavigate: (route: string) => void;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getUsers();
      setUsers(res.users);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleToggle = async (user: User) => {
    const nextRole = user.role === 'admin' ? 'customer' : 'admin';
    try {
      const updated = await api.updateUser(user.id, { role: nextRole });
      setUsers(users.map(u => (u.id === user.id ? updated : u)));
      showToast(
        `${user.name}: ${nextRole === 'admin' ? t('admin.users.roleAdmin') : t('admin.users.roleCustomer')}`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || t('admin.state.error'), 'error');
    }
  };

  const handleStatusToggle = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await api.updateUser(user.id, { status: nextStatus });
      setUsers(users.map(u => (u.id === user.id ? updated : u)));
      showToast(`${user.name}: ${t(`admin.status.${nextStatus}`, nextStatus)}`, 'info');
    } catch (err: any) {
      showToast(err.message || t('admin.state.error'), 'error');
    }
  };

  const filtered = users.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            {t('admin.users.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('admin.users.subtitle')}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.customers.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <span className="text-xs text-slate-400">
          {t('admin.users.title')}: <strong className="text-white tabular-nums">{filtered.length}</strong>
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-[#0d0f17] border border-white/10 rounded-3xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="p-4 pl-6">{t('admin.users.name')}</th>
              <th className="p-4">{t('admin.users.email')}</th>
              <th className="p-4">{t('admin.users.role')}</th>
              <th className="p-4">{t('admin.users.status')}</th>
              <th className="p-4">{t('admin.users.createdDate')}</th>
              <th className="p-4 pr-6 text-right">{t('admin.btn.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  {t('admin.state.loading')}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  {t('admin.state.noData')}
                </td>
              </tr>
            ) : (
              filtered.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-slate-300">
                        {user.role === 'admin' ? (
                          <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <UserIcon className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <span className="font-bold text-white text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300 font-mono">{user.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        user.role === 'admin'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : 'bg-white/5 text-slate-300 border-white/10'
                      }`}
                    >
                      {user.role === 'admin' ? t('admin.users.roleAdmin') : t('admin.users.roleCustomer')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {t(`admin.status.${user.status}`, user.status)}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 tabular-nums">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRoleToggle(user)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          user.role === 'admin'
                            ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                            : 'bg-indigo-600/30 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/50'
                        }`}
                      >
                        {user.role === 'admin' ? t('admin.users.revokeAdmin') : t('admin.users.makeAdmin')}
                      </button>
                      <button
                        onClick={() => handleStatusToggle(user)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          user.status === 'active'
                            ? 'border-rose-500/30 text-rose-400 hover:bg-rose-950/20'
                            : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/20'
                        }`}
                      >
                        {user.status === 'active' ? t('admin.users.suspend') : t('admin.users.activate')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

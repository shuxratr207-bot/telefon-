import React, { useState, useEffect } from 'react';
import { Package, ShieldCheck, LogOut, Save, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
  initialMode?: 'login' | 'register';
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, initialMode = 'login' }) => {
  const { user, login, register, logout, updateUser, isAdmin } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { showToast } = useToast();
  const { t } = useLanguage();

  // Authentication mode if guest
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAuthMode(initialMode);
  }, [initialMode]);

  // Profile edit fields
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editCity, setEditCity] = useState(user?.city || '');
  const [editRegion, setEditRegion] = useState(user?.region || '');
  const [activeTab, setActiveTab] = useState<'info' | 'wishlist'>('info');

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditAddress(user.address || '');
      setEditCity(user.city || '');
      setEditRegion(user.region || '');
    }
  }, [user]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPassword) {
      showToast(t('auth.fillRequired'), 'error');
      return;
    }
    if (authMode === 'register' && authConfirmPassword && authPassword !== authConfirmPassword) {
      showToast(t('auth.passwordMismatch'), 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        if (!authEmail.trim()) {
          showToast(t('auth.fillRequired'), 'error');
          setIsSubmitting(false);
          return;
        }
        const loggedUser = await login(authEmail.trim(), authPassword);
        if (loggedUser.role === 'admin') {
          showToast(t('auth.welcomeBack'), 'success');
          onNavigate('/admin');
          return;
        }
        showToast(t('auth.welcomeBack'), 'success');
      } else {
        const registeredUser = await register({
          name: authName.trim(),
          email: authEmail.trim(),
          password: authPassword,
          phone: authPhone.trim(),
        });
        if (registeredUser.role === 'admin') {
          showToast(t('auth.welcomeBack'), 'success');
          onNavigate('/admin');
          return;
        }
        showToast(t('auth.accountCreated'), 'success');
      }
    } catch (err: any) {
      showToast(err.message || t('admin.state.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        name: editName,
        phone: editPhone,
        address: editAddress,
        city: editCity,
        region: editRegion,
      });
      showToast(t('auth.profileUpdated'), 'success');
    } catch (err: any) {
      showToast(err.message || t('admin.state.error'), 'error');
    }
  };

  // If not logged in, render authentication portal
  if (!user) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-32 pb-24 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#0d0f17] border border-cyan-500/20 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
              {authMode === 'login' ? t('auth.signInTitle') : t('auth.signUpTitle')}
            </h1>
            <p className="text-xs text-slate-400">
              {t('auth.subtitle')}
            </p>
          </div>

          {/* Mode Switcher: Kirish | Ro‘yxatdan o‘tish */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-black/50 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                onNavigate('/signin');
              }}
              className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('auth.signInTab')}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                onNavigate('/signup');
              }}
              className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all ${
                authMode === 'register'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('auth.signUpTab')}
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('auth.fullName')} *
                </label>
                <input
                  type="text"
                  value={authName}
                  onChange={e => setAuthName(e.target.value)}
                  placeholder="Azizbek Karimov"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('auth.email')} *
              </label>
              <input
                type="email"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                placeholder="mijoz@novamobile.uz"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('auth.phone')} *
                </label>
                <input
                  type="tel"
                  value={authPhone}
                  onChange={e => setAuthPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  {t('auth.password')} *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? t('auth.hidePassword') : t('auth.showPassword')}</span>
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('auth.confirmPassword')} *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={authConfirmPassword}
                  onChange={e => setAuthConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all"
            >
              {isSubmitting
                ? t('checkout.processing')
                : authMode === 'login'
                ? t('auth.signInBtn')
                : t('auth.signUpBtn')}
            </button>
          </form>

          {/* Subtle, separate link to Admin Login below Sign In / Sign Up */}
          <div className="pt-3 border-t border-white/5 text-center">
            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('auth.adminLoginLink')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Profile Card */}
        <div className="p-8 rounded-3xl bg-[#0d0f17] border border-white/10 shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px]">
              <div className="w-full h-full bg-[#0d0f17] rounded-[15px] flex items-center justify-center font-extrabold text-2xl text-cyan-400">
                {user.name.charAt(0)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                {isAdmin ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {t('nav.storeAdmin')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {t('nav.vipCustomer')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => onNavigate('/admin')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t('nav.adminPanel')}</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('/orders')}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition-all flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-cyan-400" />
              <span>{t('nav.orders')}</span>
            </button>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-950/30 transition-colors"
              title={t('nav.signout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 border-b border-white/10 mb-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t('auth.savedDelivery')}
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'wishlist'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t('auth.savedWishlist')} ({wishlistItems.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' ? (
          <form onSubmit={handleUpdateProfile} className="bg-[#0d0f17] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-white mb-2">{t('auth.editProfileTitle')}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">{t('checkout.fullName')}</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">{t('checkout.phone')}</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">{t('checkout.address')}</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">{t('checkout.city')}</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={e => setEditCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">{t('checkout.region')}</label>
                <input
                  type="text"
                  value={editRegion}
                  onChange={e => setEditRegion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{t('auth.saveChanges')}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-[#0d0f17] border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-white">{t('wishlist.title')}</h3>
              <button
                onClick={() => onNavigate('/wishlist')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>{t('home.viewAll')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {wishlistItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">{t('wishlist.emptyTitle')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlistItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate(`/phones/${item.productId}`)}
                    className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-500/30 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                      <div>
                        <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                        <span className="text-xs text-cyan-400 font-bold">${item.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

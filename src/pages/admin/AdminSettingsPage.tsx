import React, { useState, useEffect } from 'react';
import { Save, Store, Truck, Shield, Bell } from 'lucide-react';
import { StoreSettings } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface AdminSettingsPageProps {
  onNavigate: (route: string) => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getSettings()
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !settings) {
    return <div className="text-slate-400 p-8">{t('admin.state.loading')}</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      showToast(t('admin.btn.save'), 'success');
    } catch {
      showToast(t('admin.state.error'), 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
          {t('admin.settings.title')}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{t('admin.settings.subtitle')}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Identity */}
        <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Store className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">{t('admin.settings.storeSettings')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {t('admin.settings.storeName')}
              </label>
              <input
                type="text"
                value={settings.store.name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    store: { ...settings.store, name: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {t('admin.settings.email')}
              </label>
              <input
                type="email"
                value={settings.store.email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    store: { ...settings.store, email: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {t('admin.settings.phone')}
              </label>
              <input
                type="text"
                value={settings.store.phone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    store: { ...settings.store, phone: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {t('admin.settings.address')}
              </label>
              <input
                type="text"
                value={settings.store.address}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    store: { ...settings.store, address: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {t('admin.settings.logo')}
              </label>
              <input
                type="text"
                value={settings.store.logo}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    store: { ...settings.store, logo: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {t('admin.settings.socialLinks')} (Telegram / Instagram)
              </label>
              <input
                type="text"
                value={settings.store.socialLinks.telegram}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    store: {
                      ...settings.store,
                      socialLinks: { ...settings.store.socialLinks, telegram: e.target.value },
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Order Settings */}
        <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Truck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              {t('admin.settings.deliverySettings')} & {t('admin.settings.orderSettings')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {t('admin.settings.standardDeliveryPrice')} ($)
              </label>
              <input
                type="number"
                value={settings.delivery.standardPrice}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery: { ...settings.delivery, standardPrice: Number(e.target.value) },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {t('admin.settings.expressDeliveryPrice')} ($)
              </label>
              <input
                type="number"
                value={settings.delivery.expressPrice}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery: { ...settings.delivery, expressPrice: Number(e.target.value) },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {t('admin.settings.freeDeliveryThreshold')} ($)
              </label>
              <input
                type="number"
                value={settings.delivery.freeDeliveryThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery: {
                      ...settings.delivery,
                      freeDeliveryThreshold: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">{t('admin.settings.adminProfile')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {t('admin.customers.name')}
              </label>
              <input
                type="text"
                defaultValue="NOVA Administrator"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {t('admin.settings.email')}
              </label>
              <input
                type="email"
                defaultValue="admin@novamobile.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Security & Notifications */}
        <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Shield className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">
              {t('admin.settings.security')} & {t('admin.settings.notifications')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">
                  {t('admin.notifications.newOrder')}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.security.twoFactorEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactorEnabled: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded accent-cyan-500"
              />
            </label>
            <label className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">
                  {t('admin.notifications.lowStock')}
                </span>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-cyan-500" />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> {t('admin.btn.save')}
        </button>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Truck, Store, Lock } from 'lucide-react';
import { StoreSettings } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface AdminSettingsPageProps {
  onNavigate: (route: string) => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Local form state
  const [storeName, setStoreName] = useState('NOVA MOBILE');
  const [phone, setPhone] = useState('+1 (800) 890-NOVA');
  const [email, setEmail] = useState('support@novamobile.store');
  const [address, setAddress] = useState('400 Technology Way, Silicon District, San Francisco, CA');
  const [standardPrice, setStandardPrice] = useState(0);
  const [expressPrice, setExpressPrice] = useState(15);
  const [freeThreshold, setFreeThreshold] = useState(500);

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const res = await api.getSettings();
        setSettings(res);
        setStoreName(res.store.name);
        setPhone(res.store.phone);
        setEmail(res.store.email);
        setAddress(res.store.address);
        setStandardPrice(res.delivery.standardPrice);
        setExpressPrice(res.delivery.expressPrice);
        setFreeThreshold(res.delivery.freeDeliveryThreshold);
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated: Partial<StoreSettings> = {
        store: {
          name: storeName,
          logo: settings?.store.logo || '',
          phone,
          email,
          address,
          socialLinks: settings?.store.socialLinks || {
            instagram: 'https://instagram.com/novamobile',
            telegram: 'https://t.me/novamobile',
            youtube: 'https://youtube.com/@novamobile',
            tiktok: 'https://tiktok.com/@novamobile',
          },
        },
        delivery: {
          standardPrice: Number(standardPrice),
          expressPrice: Number(expressPrice),
          freeDeliveryThreshold: Number(freeThreshold),
        },
      };
      await api.updateSettings(updated);
      showToast('Store settings updated and synchronized across all nodes!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            Platform Settings &amp; Logistics Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure enterprise brand contact profiles, worldwide express shipping thresholds, and authentication policies.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Settings Section */}
        <div className="bg-[#0d0f17] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Store className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Store Identity &amp; Contact</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Support Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Customer Helpline</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Headquarters Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Delivery Rates Section */}
        <div className="bg-[#0d0f17] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Truck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Logistics &amp; Delivery Thresholds</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Standard Delivery Fee ($)</label>
              <input
                type="number"
                value={standardPrice}
                onChange={e => setStandardPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Express Courier Fee ($)</label>
              <input
                type="number"
                value={expressPrice}
                onChange={e => setExpressPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Free Delivery Threshold ($)</label>
              <input
                type="number"
                value={freeThreshold}
                onChange={e => setFreeThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono font-bold text-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Security & Admin Profile */}
        <div className="bg-[#0d0f17] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Lock className="w-5 h-5 text-violet-400" />
            <h3 className="text-base font-bold text-white">Security &amp; Active Administrator</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-slate-400 block font-semibold">Active Session Profile</span>
              <p className="text-white font-bold text-sm">{user?.name || 'Administrator'}</p>
              <p className="text-slate-400 font-mono">{user?.email || 'admin@novamobile.store'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-slate-400 block font-semibold">Authentication Protocol</span>
              <p className="text-emerald-400 font-bold">256-bit JWT Session Active</p>
              <p className="text-slate-400">Tokens refresh automatically with 7-day expiry.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-xl shadow-cyan-500/25"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { ShieldCheck, Truck, CreditCard, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../services/api.ts';
import { Order } from '../types/index.ts';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderSuccess }) => {
  const { items, subtotal, discount, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+998 ',
    region: user?.region || 'Toshkent shahri',
    city: user?.city || 'Shayxontohur tumani',
    address: user?.address || '',
    deliveryMethod: 'standard' as 'standard' | 'express' | 'pickup',
    paymentMethod: 'card' as 'card' | 'cod' | 'apple_pay',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">{t('cart.emptyTitle')}</h2>
        <button
          onClick={() => onNavigate('/phones')}
          className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-bold text-sm"
        >
          {t('cart.continueShopping')}
        </button>
      </div>
    );
  }

  const deliveryFee = formData.deliveryMethod === 'express' ? 15 : 0;
  const grandTotal = Math.max(0, subtotal - discount + deliveryFee);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      showToast(t('auth.fillRequired'), 'error');
      return;
    }
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        userId: user?.id,
        customer: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email || 'mijoz@novamobile.uz',
          region: formData.region,
          city: formData.city,
          address: formData.address,
        },
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        items: items.map((it) => ({
          productId: it.productId,
          name: it.name,
          productName: it.productName || it.name,
          brand: it.brand,
          image: it.image,
          color: it.color,
          storage: it.storage,
          ram: it.ram || '',
          model: it.model || '',
          price: it.price,
          quantity: it.quantity,
        })),
        subtotal,
        discount,
        deliveryFee,
        total: grandTotal,
      });
      await clearCart();
      showToast(t('success.title'), 'success');
      onOrderSuccess(order);
      onNavigate('/order-success');
    } catch {
      showToast(t('admin.state.error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 pb-28 lg:pb-16">
      <button
        onClick={() => onNavigate('/cart')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {t('cart.title')}
      </button>

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-['Space_Grotesk'] font-extrabold text-white tracking-tight">
          {t('checkout.title')}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-1">{t('checkout.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Customer Steps */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Step 1: Contact */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0f17]/90 border border-white/10 space-y-4">
            <h2 className="text-lg font-['Space_Grotesk'] font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" /> {t('checkout.step1')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('checkout.fullName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Masalan: Sardor Rahimov"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('checkout.phone')} *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('checkout.email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0f17]/90 border border-white/10 space-y-4">
            <h2 className="text-lg font-['Space_Grotesk'] font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-cyan-400" /> {t('checkout.step2')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'standard', label: t('checkout.standardDelivery') },
                { id: 'express', label: t('checkout.expressDelivery') },
                { id: 'pickup', label: t('checkout.storePickup') },
              ].map((method) => (
                <button
                  type="button"
                  key={method.id}
                  onClick={() =>
                    setFormData({ ...formData, deliveryMethod: method.id as any })
                  }
                  className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all ${
                    formData.deliveryMethod === method.id
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('checkout.region')}
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0F1D] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  <option>Toshkent shahri</option>
                  <option>Samarqand viloyati</option>
                  <option>Buxoro viloyati</option>
                  <option>Farg‘ona viloyati</option>
                  <option>Andijon viloyati</option>
                  <option>Namangan viloyati</option>
                  <option>Xorazm viloyati</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('checkout.city')}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('checkout.address')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Masalan: Amir Temur shoh ko‘chasi, 15-uy, 42-xonadon"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('checkout.notes')}
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Payment */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0f17]/90 border border-white/10 space-y-4">
            <h2 className="text-lg font-['Space_Grotesk'] font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" /> {t('checkout.step3')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'card', label: t('checkout.payCard') },
                { id: 'apple_pay', label: t('checkout.payPayme') },
                { id: 'cod', label: t('checkout.payCash') },
              ].map((pay) => (
                <button
                  type="button"
                  key={pay.id}
                  onClick={() => setFormData({ ...formData, paymentMethod: pay.id as any })}
                  className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all ${
                    formData.paymentMethod === pay.id
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {pay.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0f17] border border-white/10 sticky top-28 space-y-6">
            <h3 className="text-xl font-['Space_Grotesk'] font-bold text-white">
              {t('cart.orderSummary')}
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2 border-b border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-contain bg-white/5 p-1"
                    />
                    <div>
                      <div className="text-xs font-bold text-white line-clamp-1">{item.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.quantity}x • {[item.color, item.storage, item.ram, item.model].filter(Boolean).join(' • ')}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white">
                    ${(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-sm border-t border-white/10 pt-4">
              <div className="flex justify-between text-slate-400">
                <span>{t('cart.subtotal')}</span>
                <span className="text-white font-semibold">${subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>{t('cart.discount')}</span>
                  <span className="font-semibold">-${discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>{t('cart.shipping')}</span>
                <span className="text-emerald-400 font-semibold">
                  {deliveryFee === 0 ? t('cart.free') : `$${deliveryFee}`}
                </span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-base font-bold text-white">{t('cart.total')}</span>
                <span className="text-2xl font-['Space_Grotesk'] font-extrabold text-white">
                  ${grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all cursor-pointer"
            >
              {submitting ? t('checkout.processing') : t('checkout.placeOrder')}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-bit SSL himoyalangan xavfsiz xarid</span>
            </div>
          </div>
        </div>
      </form>

      {/* Sticky Mobile Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#090D16]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 flex items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="text-[11px] text-slate-400">{t('cart.total')}</div>
          <div className="text-lg font-['Space_Grotesk'] font-extrabold text-white">
            ${grandTotal.toLocaleString()}
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25"
        >
          {submitting ? t('checkout.processing') : t('checkout.placeOrder')}
        </button>
      </div>
    </div>
  );
};

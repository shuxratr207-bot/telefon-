import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
  onOrderSuccess: (orderData: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderSuccess }) => {
  const { items, subtotal, discount, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Customer form
  const [customer, setCustomer] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    region: user?.region || 'California',
    city: user?.city || 'San Francisco',
    address: user?.address || '400 Technology Way',
  });

  // 2. Delivery option
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express' | 'pickup'>('express');

  // 3. Payment option (Mock Payment Only)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'apple_pay'>('card');
  const [mockCardName, setMockCardName] = useState('John Appleseed');
  const [mockCardNumber, setMockCardNumber] = useState('•••• •••• •••• 4242');

  const deliveryCost =
    deliveryMethod === 'express' ? (subtotal >= 500 ? 0 : 15) : deliveryMethod === 'standard' ? 0 : 0;
  const finalTotal = Math.max(0, subtotal - discount + deliveryCost);

  // Validation
  const validateStep1 = () => {
    if (!customer.fullName.trim() || !customer.email.trim() || !customer.phone.trim() || !customer.address.trim()) {
      showToast('Please fill in all contact and address fields.', 'error');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const orderPayload = {
        customer,
        deliveryMethod,
        paymentMethod,
        items: items.map(it => ({
          productId: it.productId,
          name: it.name,
          brand: it.brand,
          image: it.image,
          color: it.color,
          storage: it.storage,
          price: it.price,
          quantity: it.quantity,
        })),
        subtotal,
        discount,
        deliveryFee: deliveryCost,
        total: finalTotal,
      };

      const createdOrder = await api.createOrder(orderPayload);
      await clearCart();
      onOrderSuccess(createdOrder);
      onNavigate(`/order-success?id=${createdOrder.orderNumber}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-32 pb-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">No Items In Cart</h2>
        <p className="text-sm text-slate-400 mb-6">Add devices to your cart before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('/phones')}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs"
        >
          Browse Smartphones
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-white font-['Space_Grotesk'] mb-3">
            Secure Checkout
          </h1>
          <div className="flex items-center justify-center max-w-xl mx-auto">
            {[
              { num: 1, label: 'Customer' },
              { num: 2, label: 'Delivery' },
              { num: 3, label: 'Payment' },
              { num: 4, label: 'Confirm' },
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep === step.num
                        ? 'bg-cyan-500 text-black ring-4 ring-cyan-500/20'
                        : currentStep > step.num
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/10 text-slate-400 border border-white/10'
                    }`}
                  >
                    {currentStep > step.num ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : step.num}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 mt-1.5">{step.label}</span>
                </div>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 -mt-4 transition-all ${
                      currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-white/10'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Wizard Form */}
          <div className="lg:col-span-8 bg-[#0d0f17] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {/* STEP 1: CUSTOMER INFORMATION */}
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">1. Customer Information</h3>
                  <p className="text-xs text-slate-400">Provide shipping recipient contact details</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customer.fullName}
                      onChange={e => setCustomer({ ...customer, fullName: e.target.value })}
                      placeholder="e.g. Alexander Vance"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={customer.email}
                      onChange={e => setCustomer({ ...customer, email: e.target.value })}
                      placeholder="alexander@example.com"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Region / State
                    </label>
                    <input
                      type="text"
                      value={customer.region}
                      onChange={e => setCustomer({ ...customer, region: e.target.value })}
                      placeholder="California"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
                    <input
                      type="text"
                      value={customer.city}
                      onChange={e => setCustomer({ ...customer, city: e.target.value })}
                      placeholder="San Francisco"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Street Address &amp; Suite / Apt
                    </label>
                    <input
                      type="text"
                      value={customer.address}
                      onChange={e => setCustomer({ ...customer, address: e.target.value })}
                      placeholder="400 Technology Way, Suite 12B"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DELIVERY METHOD */}
            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">2. Delivery Preference</h3>
                  <p className="text-xs text-slate-400">Choose how your hardware will arrive</p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'express',
                      title: 'Express Delivery (Next Business Day)',
                      desc: 'Priority insured air courier dispatch with live GPS tracking.',
                      cost: subtotal >= 500 ? 'FREE' : '$15.00',
                      icon: Truck,
                    },
                    {
                      id: 'standard',
                      title: 'Standard Delivery (2-3 Business Days)',
                      desc: 'Complimentary standard insured road parcel delivery.',
                      cost: 'FREE',
                      icon: Truck,
                    },
                    {
                      id: 'pickup',
                      title: 'NOVA Flagship Store Pickup',
                      desc: 'Collect directly from our Silicon District showroom with concierge setup.',
                      cost: 'FREE',
                      icon: Building,
                    },
                  ].map(method => {
                    const isSelected = deliveryMethod === method.id;
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setDeliveryMethod(method.id as any)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-500/20'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{method.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{method.desc}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold font-mono text-cyan-400">
                          {method.cost}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: MOCK PAYMENT ONLY */}
            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">3. Mock Payment Option</h3>
                  <p className="text-xs text-slate-400">
                    Safe testing environment. No real money or financial credentials are charged.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'card',
                      title: 'Credit / Debit Card (Mock Sandbox)',
                      desc: 'Instant mock transaction authorization.',
                      icon: CreditCard,
                    },
                    {
                      id: 'apple_pay',
                      title: 'Apple Pay / Digital Wallet',
                      desc: 'Simulated 1-tap biometric payment.',
                      icon: Smartphone,
                    },
                    {
                      id: 'cod',
                      title: 'Cash on Delivery',
                      desc: 'Pay courier securely upon unboxing and physical verification.',
                      icon: ShieldCheck,
                    },
                  ].map(pay => {
                    const isSelected = paymentMethod === pay.id;
                    const Icon = pay.icon;
                    return (
                      <div
                        key={pay.id}
                        onClick={() => setPaymentMethod(pay.id as any)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-500/20'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{pay.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{pay.desc}</p>
                          </div>
                        </div>
                        <div className="w-4 h-4 rounded-full border border-cyan-400 flex items-center justify-center">
                          {isSelected && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-2">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Mock Card Sandbox Auto-Configured (Test Safe)</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={mockCardName}
                        onChange={e => setMockCardName(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Mock Card Number
                      </label>
                      <input
                        type="text"
                        value={mockCardNumber}
                        onChange={e => setMockCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4: ORDER CONFIRMATION */}
            {currentStep === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">4. Review &amp; Confirm Order</h3>
                  <p className="text-xs text-slate-400">
                    Verify all recipient and device information before final authorization.
                  </p>
                </div>

                {/* Recipient summary */}
                <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-semibold">Recipient:</span>
                    <span className="text-white font-bold">{customer.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-semibold">Destination:</span>
                    <span className="text-white">{customer.address}, {customer.city}, {customer.region}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-semibold">Contact:</span>
                    <span className="text-white">{customer.email} • {customer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Delivery Method:</span>
                    <span className="text-cyan-400 capitalize font-bold">{deliveryMethod} Delivery</span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="divide-y divide-white/5">
                  {items.map(it => (
                    <div key={it.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={it.image} alt={it.name} className="w-12 h-12 object-contain" />
                        <div>
                          <h5 className="text-sm font-semibold text-white">{it.name}</h5>
                          <p className="text-xs text-slate-400">
                            {it.color} • {it.storage} • Qty: {it.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white">
                        ${(it.price * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  onClick={() => setCurrentStep((currentStep - 1) as any)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('/cart')}
                  className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Cart</span>
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/20"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'PLACING ORDER...' : 'AUTHORIZE ORDER'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-4 bg-[#0d0f17] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="text-base font-bold text-white pb-3 border-b border-white/10">
              Summary ({items.length} Items)
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white">${subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promotional Discount</span>
                  <span>-${discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Delivery Fee</span>
                <span>{deliveryCost === 0 ? <strong className="text-cyan-400">FREE</strong> : `$${deliveryCost}`}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between text-base font-extrabold text-white">
                <span>Payable Amount</span>
                <span className="text-cyan-400">${finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-white block mb-0.5">Official Warranty Included</strong>
              Every device is sealed with verified serial numbers and 24-month manufacturer guarantee.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

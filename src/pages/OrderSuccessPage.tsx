import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, Package, Calendar, ShieldCheck, Truck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderSuccessPageProps {
  orderData: any;
  onNavigate: (path: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderData, onNavigate }) => {
  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981'],
    });
  }, []);

  const orderNumber = orderData?.orderNumber || `NVM-${Math.floor(10000 + Math.random() * 90000)}`;
  const total = orderData?.total || 1349;

  // Estimated delivery date (3 days from now)
  const deliveryDate = new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pt-32 pb-24 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl w-full bg-[#0d0f17] border border-cyan-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6 relative overflow-hidden"
      >
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Animated Checkmark Icon */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </motion.div>
        </div>

        {/* Headline */}
        <div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-cyan-400">
            TRANSACTION AUTHORIZED
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk'] mt-1">
            ORDER CONFIRMED
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-sm mx-auto">
            Thank you for choosing NOVA MOBILE. Your flagship hardware is being prepared for express delivery.
          </p>
        </div>

        {/* Details card */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-sm text-left">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-cyan-400" />
              Order Number:
            </span>
            <span className="font-mono font-bold text-white text-base">{orderNumber}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Estimated Delivery:
            </span>
            <span className="font-semibold text-white">{deliveryDate}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-400" />
              Total Amount:
            </span>
            <span className="font-extrabold text-cyan-400 text-lg">${Number(total).toLocaleString()}</span>
          </div>
        </div>

        {/* Guarantee notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>A tracking notification with official warranty credentials has been sent.</span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('/orders')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-all"
          >
            View Order History
          </button>

          <button
            onClick={() => onNavigate('/phones')}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>CONTINUE SHOPPING</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

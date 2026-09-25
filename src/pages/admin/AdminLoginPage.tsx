import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminLoginPageProps {
  onNavigate: (route: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('admin@novamobile.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      showToast('Admin authentication verified. Welcome back!', 'success');
      onNavigate('/admin');
    } catch (err: any) {
      showToast(err.message || 'Invalid admin credentials', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAdminLogin = async () => {
    setEmail('admin@novamobile.com');
    setPassword('admin123');
    setIsLoading(true);
    try {
      await login('admin@novamobile.com', 'admin123');
      showToast('Signed in as Administrator!', 'success');
      onNavigate('/admin');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-gradient-to-tr from-cyan-600/10 via-indigo-600/10 to-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-[#0d0f17] border border-cyan-500/20 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 p-[1px] mx-auto shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0d0f17] rounded-[15px] flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-['Space_Grotesk'] tracking-wider">
            NOVA CONTROL STUDIO
          </h1>
          <p className="text-xs text-slate-400">
            Authorized administrative management &amp; operations
          </p>
        </div>

        {/* 1-Click Fast Admin Demo Trigger */}
        <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-center">
          <p className="text-[11px] text-indigo-300 font-semibold mb-2">
            Administrator Demonstration Credentials
          </p>
          <button
            type="button"
            onClick={handleDemoAdminLogin}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Admin Access (admin@novamobile.com)</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@novamobile.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-400"
              />
              <span>Remember Me</span>
            </label>
            <span className="text-slate-500 text-[10px]">Encrypted JWT Session</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Verifying...' : 'Sign In to Admin Panel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            onClick={() => onNavigate('/')}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Return to Public Storefront
          </button>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setIsForgotModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#0d0f17] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Reset Admin Password</h3>
                <button onClick={() => setIsForgotModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400">
                For administrative accounts, your password can be recovered using master demo key: <strong className="text-cyan-400">admin123</strong>.
              </p>
              <input
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="admin@novamobile.com"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => {
                  showToast('Password reset link sent to registered administrative inbox!', 'info');
                  setIsForgotModalOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs uppercase"
              >
                Send Recovery Key
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

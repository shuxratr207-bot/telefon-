import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useCompare } from '../../context/CompareContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { SearchModal } from './SearchModal.tsx';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareProducts } = useCompare();
  const { user, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Phones', path: '/phones' },
    { label: 'Brands', path: '/brands' },
    { label: 'Compare', path: '/compare', badge: compareProducts.length > 0 ? compareProducts.length : null },
    { label: 'Deals', path: '/deals', isHot: true },
    { label: 'About', path: '/about' },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#090a0f]/80 backdrop-blur-xl border-b border-cyan-500/15 py-3.5 shadow-lg shadow-black/40'
            : 'bg-transparent py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => handleNavClick('/')}
                className="flex items-center gap-2.5 text-left group focus:outline-none"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all">
                  <div className="w-full h-full bg-[#090a0f] rounded-[11px] flex items-center justify-center">
                    <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 text-lg tracking-tighter">
                      N
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-extrabold tracking-wider text-lg sm:text-xl font-['Space_Grotesk'] text-white">
                    NOVA<span className="text-cyan-400">.</span>MOBILE
                  </span>
                  <span className="hidden sm:block text-[9px] tracking-[0.25em] text-slate-400 uppercase font-medium -mt-1">
                    Flagship Studio
                  </span>
                </div>
              </button>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                {navLinks.map(link => {
                  const isActive = currentPath === link.path;
                  return (
                    <button
                      key={link.path}
                      onClick={() => handleNavClick(link.path)}
                      className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                      {link.isHot && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                      )}
                      {link.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                title="Search (Cmd+K)"
              >
                <Search className="w-4 h-4 text-cyan-400" />
                <span className="hidden lg:inline text-xs text-slate-400">Search phones...</span>
                <kbd className="hidden lg:inline text-[10px] text-slate-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                  ⌘K
                </kbd>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => handleNavClick('/wishlist')}
                className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-400 fill-rose-500/20' : ''}`} />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-rose-500/30"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                title="Cart"
              >
                <ShoppingBag className={`w-5 h-5 ${itemCount > 0 ? 'text-cyan-400' : ''}`} />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-cyan-500/30"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </button>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`p-2.5 rounded-xl transition-all border ${
                    isAdmin
                      ? 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300'
                      : user
                      ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
                  }`}
                  title={user ? user.name : 'Account'}
                >
                  <UserIcon className="w-5 h-5" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-[#0d0f17] border border-cyan-500/20 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                    >
                      {user ? (
                        <>
                          <div className="p-3 border-b border-white/5">
                            <p className="text-xs text-slate-400">Signed in as</p>
                            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            {isAdmin && (
                              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-300">
                                <ShieldCheck className="w-3 h-3" />
                                Store Administrator
                              </div>
                            )}
                          </div>

                          <div className="py-1">
                            {isAdmin && (
                              <button
                                onClick={() => handleNavClick('/admin')}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm text-indigo-300 hover:bg-indigo-950/40 rounded-xl transition-colors font-medium"
                              >
                                <span className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                                  Admin Control Panel
                                </span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleNavClick('/profile')}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                            >
                              <span>My Profile & Settings</span>
                              <ChevronRight className="w-4 h-4 text-slate-500" />
                            </button>

                            <button
                              onClick={() => handleNavClick('/orders')}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                            >
                              <span>Order History</span>
                              <ChevronRight className="w-4 h-4 text-slate-500" />
                            </button>

                            <button
                              onClick={() => handleNavClick('/wishlist')}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                            >
                              <span>Saved Wishlist</span>
                              <span className="text-xs font-semibold text-slate-500">
                                {wishlistCount}
                              </span>
                            </button>
                          </div>

                          <div className="pt-1 border-t border-white/5">
                            <button
                              onClick={() => {
                                logout();
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-3 text-center">
                          <p className="text-sm font-semibold text-white mb-1">Welcome to NOVA</p>
                          <p className="text-xs text-slate-400 mb-3">Sign in to track orders and save devices.</p>
                          <button
                            onClick={() => handleNavClick('/profile')}
                            className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all mb-2"
                          >
                            Sign In / Register
                          </button>
                          <button
                            onClick={() => handleNavClick('/admin/login')}
                            className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium transition-all"
                          >
                            Admin Portal Login
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-white/10"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden bg-black/80 backdrop-blur-xl flex flex-col pt-24 px-6 pb-8"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`flex items-center justify-between py-3 px-4 rounded-xl text-base font-semibold transition-all ${
                    currentPath === link.path
                      ? 'bg-cyan-950/50 border border-cyan-500/30 text-cyan-400'
                      : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.label}
                    {link.isHot && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded font-bold">
                        HOT
                      </span>
                    )}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </button>
              ))}

              <div className="pt-4 border-t border-white/10 flex flex-col space-y-2">
                <button
                  onClick={() => handleNavClick('/cart')}
                  className="flex items-center justify-between py-3 px-4 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5"
                >
                  <span className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-cyan-400" />
                    Shopping Cart
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full">
                    {itemCount}
                  </span>
                </button>

                <button
                  onClick={() => handleNavClick('/wishlist')}
                  className="flex items-center justify-between py-3 px-4 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5"
                >
                  <span className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-rose-400" />
                    Wishlist
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-full">
                    {wishlistCount}
                  </span>
                </button>

                <button
                  onClick={() => handleNavClick('/compare')}
                  className="flex items-center justify-between py-3 px-4 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5"
                >
                  <span className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    Compare Devices
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full">
                    {compareProducts.length}/3
                  </span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleNavClick('/admin')}
                    className="flex items-center justify-between py-3 px-4 rounded-xl text-base font-bold text-indigo-300 bg-indigo-950/40 border border-indigo-500/30"
                  >
                    <span className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-indigo-400" />
                      Admin Control Panel
                    </span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={id => onNavigate(`/phones/${id}`)}
      />
    </>
  );
};

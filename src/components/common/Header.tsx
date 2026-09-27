import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Search,
  ShoppingCart,
  Heart,
  Scale,
  User as UserIcon,
  Menu,
  X,
  Flame,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Package,
  Globe,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useCompare } from '../../context/CompareContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage, Language } from '../../context/LanguageContext.tsx';
import { Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareProducts } = useCompare();
  const { user, logout, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      api
        .getProducts({ search: searchQuery.trim() })
        .then((res) => {
          setSearchResults(res.products.slice(0, 5));
          setShowSuggestions(true);
        })
        .catch(() => {
          setSearchResults([]);
        });
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        desktopSearchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.phones'), path: '/phones' },
    { name: t('nav.brands'), path: '/brands' },
    { name: t('nav.compare'), path: '/compare' },
    { name: t('nav.deals'), path: '/deals', highlight: true },
    { name: t('nav.about'), path: '/about' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onNavigate(`/phones?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090a0f]/90 border-b border-white/10 transition-all">
      {/* Top Language & Utility Bar */}
      <div className="bg-gradient-to-r from-cyan-950/50 via-[#090E1A] to-indigo-950/50 border-b border-white/5 py-1.5 px-4">
        <div className="max-w-[1440px] mx-auto sm:px-2 lg:px-6 flex items-center justify-between text-[11px] text-slate-300">
          <div className="hidden md:flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> {t('trust.warrantyTitle')}
            </span>
            <span className="text-slate-600">•</span>
            <span>{t('detail.deliveryInfo')}</span>
          </div>

          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
              <Globe className="w-3 h-3 text-slate-400 ml-1.5 mr-0.5" />
              {(['UZ', 'RU', 'EN'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    language === lang
                      ? 'bg-cyan-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {isAdmin && (
              <button
                onClick={() => onNavigate('/admin')}
                className="hidden sm:inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> {t('nav.adminPanel')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 lg:gap-6">
          {/* Brand Logo */}
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0 cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="font-['Space_Grotesk'] font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1">
                NOVA
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  MOBILE
                </span>
              </div>
              <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-medium -mt-1">
                {t('nav.flagshipStudio')}
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => onNavigate(link.path)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.highlight && (
                    <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  )}
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Smart Search Bar (Desktop) */}
          <div ref={searchRef} className="hidden md:block relative flex-1 max-w-xs xl:max-w-md">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={desktopSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
                placeholder={t('nav.searchPlaceholder')}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.07] transition-all"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden xl:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white/5 border border-white/10 rounded">
                  /
                </kbd>
              )}
            </form>

            {/* Instant Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-[#0d0f17] border border-white/10 shadow-2xl overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setShowSuggestions(false);
                          setSearchQuery('');
                          onNavigate(`/phones/${item.id}`);
                        }}
                        className="w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                      >
                        <img
                          src={item.images?.[0]}
                          alt={item.name}
                          className="w-11 h-11 rounded-lg object-contain bg-white/5 p-1 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-cyan-400 font-medium">{item.brand}</div>
                          <div className="text-sm font-semibold text-white truncate">
                            {item.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">
                            ${item.price.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-emerald-400">
                            {t('product.inStock')}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-400">
                    "{searchQuery}" — {t('catalog.noResults')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Compare */}
            <button
              onClick={() => onNavigate('/compare')}
              title={t('nav.compare')}
              className="relative p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
              {compareProducts.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                  {compareProducts.length}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('/wishlist')}
              title={t('nav.wishlist')}
              className="relative p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              title={t('nav.cart')}
              className="relative p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/30 text-white flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              <span className="hidden sm:inline text-xs font-bold">{t('nav.cart')}</span>
              {itemCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-500 text-black text-[10px] font-extrabold">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
              >
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                {user && (
                  <span className="hidden xl:inline text-xs font-semibold text-white max-w-[90px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                )}
              </button>

              {userMenuOpen && (
                <div
                  onMouseLeave={() => setUserMenuOpen(false)}
                  className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0d0f17] border border-white/10 shadow-2xl p-2 z-50"
                >
                  {user ? (
                    <>
                      <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                        <div className="text-xs text-slate-400">{t('nav.signedInAs')}</div>
                        <div className="text-sm font-bold text-white truncate">{user.name}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-400">
                          {user.role === 'admin' ? t('nav.storeAdmin') : t('nav.vipCustomer')}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate('/profile');
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-200 hover:bg-white/5 flex items-center gap-2.5"
                      >
                        <UserIcon className="w-4 h-4 text-cyan-400" /> {t('nav.profile')}
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate('/orders');
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-200 hover:bg-white/5 flex items-center gap-2.5"
                      >
                        <Package className="w-4 h-4 text-purple-400" /> {t('nav.orders')}
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigate('/admin');
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2.5"
                        >
                          <ShieldCheck className="w-4 h-4" /> {t('nav.adminControl')}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full mt-1 pt-2 border-t border-white/10 px-3 py-2 rounded-xl text-left text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5"
                      >
                        <LogOut className="w-4 h-4" /> {t('nav.signout')}
                      </button>
                    </>
                  ) : (
                    <div className="p-2 space-y-2">
                      <div className="text-xs font-semibold text-white px-1">
                        {t('nav.welcome')}
                      </div>
                      <p className="text-[11px] text-slate-400 px-1">{t('nav.welcomeSub')}</p>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate('/signin');
                        }}
                        className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-colors"
                      >
                        {t('nav.signin')} / {t('nav.signup')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0F1D] border-b border-white/10 px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.searchShort')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </form>

          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(link.path);
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  {link.highlight && <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />}
                  {link.name}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/admin');
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 mt-2"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {t('nav.adminPanel')}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

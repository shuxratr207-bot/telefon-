import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Smartphone, ArrowRight } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPicks = [
    'iPhone',
    'Samsung',
    'Google',
    'Xiaomi',
    '256GB',
    '512GB',
    '1000$ gacha',
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        let cleanQuery = query.trim();
        let minPrice: number | undefined;
        let maxPrice: number | undefined;

        if (cleanQuery.toLowerCase().includes('under $1000') || cleanQuery.toLowerCase().includes('under 1000') || cleanQuery.toLowerCase().includes('1000$ gacha')) {
          maxPrice = 1000;
          cleanQuery = '';
        }

        const res = await api.getProducts({
          search: cleanQuery,
          maxPrice,
          minPrice,
        });
        setResults(res.products.slice(0, 6));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#0d0f17] border border-cyan-500/20 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
              <Search className="w-5 h-5 text-cyan-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="w-full bg-transparent text-white placeholder-slate-400 text-base sm:text-lg focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-slate-400 bg-white/5 border border-white/10 rounded">
                ESC
              </kbd>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-4 py-2.5 bg-black/30 border-b border-white/5 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
              {quickPicks.map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all shrink-0"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : results.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {results.map(prod => (
                    <motion.div
                      key={prod.id}
                      onClick={() => {
                        onSelectProduct(prod.id);
                        onClose();
                      }}
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-1">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
                              {prod.brand}
                            </span>
                            {prod.deal && (
                              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                                {t('product.hotDeal')}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                            {prod.name}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">
                            {prod.processor} • {prod.storage.join('/')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">${prod.price}</div>
                          {prod.oldPrice > prod.price && (
                            <div className="text-xs text-slate-500 line-through">${prod.oldPrice}</div>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="py-12 text-center text-slate-400">
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                  <p className="text-sm font-medium text-slate-300">{t('catalog.noResults')}</p>
                  <p className="text-xs text-slate-500 mt-1">{t('catalog.noResultsSub')}</p>
                </div>
              ) : (
                <div className="py-8 px-4 text-center text-xs text-slate-500">
                  {t('nav.searchPlaceholder')}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

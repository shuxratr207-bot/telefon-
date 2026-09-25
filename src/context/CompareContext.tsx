import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/index.ts';

interface CompareContextType {
  compareProducts: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareProducts, setCompareProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('nova_compare_products');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('nova_compare_products', JSON.stringify(compareProducts));
  }, [compareProducts]);

  const isInCompare = (productId: string) => {
    return compareProducts.some(p => p.id === productId);
  };

  const addToCompare = (product: Product): boolean => {
    if (isInCompare(product.id)) {
      return true;
    }
    if (compareProducts.length >= 3) {
      return false; // Reached maximum of 3 smartphones
    }
    setCompareProducts([...compareProducts, product]);
    return true;
  };

  const removeFromCompare = (productId: string) => {
    setCompareProducts(compareProducts.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareProducts([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareProducts,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

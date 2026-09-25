import React, { createContext, useContext, useState, useEffect } from 'react';
import { WishlistItem, Product } from '../types/index.ts';
import { api } from '../services/api.ts';

interface WishlistContextType {
  items: WishlistItem[];
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const local = localStorage.getItem('nova_wishlist_items');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    async function loadWishlist() {
      try {
        const res = await api.getWishlist();
        if (res.items && res.items.length > 0) {
          setItems(res.items);
          localStorage.setItem('nova_wishlist_items', JSON.stringify(res.items));
        } else if (items.length > 0) {
          await api.saveWishlist(items);
        }
      } catch (e) {
        // Local fallback
      }
    }
    loadWishlist();
  }, []);

  const syncItems = async (newItems: WishlistItem[]) => {
    setItems(newItems);
    localStorage.setItem('nova_wishlist_items', JSON.stringify(newItems));
    try {
      await api.saveWishlist(newItems);
    } catch (e) {
      console.warn('Wishlist sync pending:', e);
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(it => it.productId === productId);
  };

  const toggleWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) {
      const filtered = items.filter(it => it.productId !== product.id);
      await syncItems(filtered);
    } else {
      const newItem: WishlistItem = {
        id: `wish-${Date.now()}`,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        image: product.images[0],
        price: product.price,
        oldPrice: product.oldPrice,
        inStock: product.stock > 0,
        rating: product.rating,
        category: product.category,
      };
      await syncItems([newItem, ...items]);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const filtered = items.filter(it => it.productId !== productId);
    await syncItems(filtered);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

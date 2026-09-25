import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types/index.ts';
import { api } from '../services/api.ts';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, options?: { color?: string; storage?: string; ram?: string; quantity?: number }) => Promise<void>;
  updateQuantity: (id: string, delta: number) => Promise<void>;
  setExactQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  lastAddedItem: CartItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const local = localStorage.getItem('nova_cart_items');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  // Sync with API on mount
  useEffect(() => {
    async function loadCart() {
      try {
        const res = await api.getCart();
        if (res.items && res.items.length > 0) {
          setItems(res.items);
          localStorage.setItem('nova_cart_items', JSON.stringify(res.items));
        } else if (items.length > 0) {
          // Push local to server
          await api.saveCart(items);
        }
      } catch (e) {
        // Fallback to local storage if API isn't ready
      }
    }
    loadCart();
  }, []);

  const syncItems = async (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('nova_cart_items', JSON.stringify(newItems));
    try {
      await api.saveCart(newItems);
    } catch (e) {
      console.warn('Cart backend sync pending:', e);
    }
  };

  const addToCart = async (
    product: Product,
    options?: { color?: string; storage?: string; ram?: string; quantity?: number }
  ) => {
    const selectedColor = options?.color || (product.colors && product.colors[0]?.name) || 'Standard';
    const selectedStorage = options?.storage || (product.storage && product.storage[0]) || '256GB';
    const selectedRam = options?.ram || (product.ram && product.ram[0]);
    const quantity = options?.quantity || 1;

    // Check if matching item exists
    const existingIndex = items.findIndex(
      it => it.productId === product.id && it.color === selectedColor && it.storage === selectedStorage
    );

    let updatedList: CartItem[];
    let targetItem: CartItem;

    if (existingIndex > -1) {
      updatedList = [...items];
      const newQty = Math.min(product.stock, updatedList[existingIndex].quantity + quantity);
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        quantity: newQty,
      };
      targetItem = updatedList[existingIndex];
    } else {
      const colorMatch = product.colors?.find(c => c.name === selectedColor);
      const displayImage = colorMatch?.image || product.images[0];

      targetItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        image: displayImage,
        color: selectedColor,
        storage: selectedStorage,
        ram: selectedRam,
        price: product.price,
        quantity,
        stock: product.stock,
      };
      updatedList = [targetItem, ...items];
    }

    setLastAddedItem(targetItem);
    await syncItems(updatedList);
  };

  const updateQuantity = async (id: string, delta: number) => {
    const updated = items
      .map(it => {
        if (it.id === id) {
          const newQty = it.quantity + delta;
          if (newQty <= 0) return null;
          return { ...it, quantity: Math.min(it.stock, newQty) };
        }
        return it;
      })
      .filter(Boolean) as CartItem[];

    await syncItems(updated);
  };

  const setExactQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }
    const updated = items.map(it => (it.id === id ? { ...it, quantity: Math.min(it.stock, quantity) } : it));
    await syncItems(updated);
  };

  const removeFromCart = async (id: string) => {
    const updated = items.filter(it => it.id !== id);
    await syncItems(updated);
  };

  const clearCart = async () => {
    await syncItems([]);
  };

  const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  // Promotional auto-discount: 5% on orders above $2000
  const discount = subtotal > 2000 ? Math.round(subtotal * 0.05) : 0;
  // Free delivery over $500
  const deliveryFee = subtotal === 0 || subtotal >= 500 ? 0 : 25;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        setExactQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        subtotal,
        discount,
        deliveryFee,
        total,
        isCartOpen,
        setIsCartOpen,
        lastAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

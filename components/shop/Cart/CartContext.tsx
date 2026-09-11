"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AddonItemSelection {
  addonId: string;
  name?: string;
  price?: number;
  value?: string;
  customText?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  addons?: AddonItemSelection[];
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  decreaseFromCart: (id: string, addons?: AddonItemSelection[]) => void;
  removeFromCart: (id: string, addons?: AddonItemSelection[]) => void;
  updateAddonCustomText?: (itemId: string, addonId: string, customText: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('flower_cart');
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('flower_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCartItems((prev) => {
      // Comparar tanto ID como addons para identificar artículos únicos
      const existingItem = prev.find((item) => 
        item.id === product.id && 
        JSON.stringify(item.addons) === JSON.stringify(product.addons)
      );
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && JSON.stringify(item.addons) === JSON.stringify(product.addons)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const decreaseFromCart = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      ).filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateAddonCustomText = (itemId: string, addonId: string, customText: string) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId && item.addons) {
          const updatedAddons = item.addons.map((ad) =>
            ad.addonId === addonId ? { ...ad, customText } : ad
          );
          return { ...item, addons: updatedAddons };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, decreaseFromCart, removeFromCart, updateAddonCustomText, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

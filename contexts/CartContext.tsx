"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CartItem {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((i) => i.serviceId === item.serviceId);
      if (existingItem) {
        return currentItems.map((i) =>
          i.serviceId === item.serviceId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...currentItems, item];
    });
  };

  const removeItem = (serviceId: string) => {
    setItems((currentItems) => currentItems.filter((i) => i.serviceId !== serviceId));
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    setItems((currentItems) =>
      currentItems.map((i) =>
        i.serviceId === serviceId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
} 
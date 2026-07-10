"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Cart, CartItem } from "@/types/cart";
import { toast } from "sonner";
import { CartToast } from "@/components/cart/CartToast/CartToast";

interface CartContextType {
  cart: Cart;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  itemCount: number;
  cartBounce: number;
}

const CART_STORAGE_KEY = "e-commerce-cart";

const emptyCart: Cart = {
  items: [],
  subtotal: 0,
  taxAmount: 0,
  shippingCost: 0,
  total: 0,
  itemCount: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateTotals(items: CartItem[], taxRate: number = 21): Cart {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const shippingCost = subtotal > 0 ? (subtotal >= 100 ? 0 : 5.99) : 0;
  const total = subtotal + taxAmount + shippingCost;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, subtotal, taxAmount, shippingCost, total, itemCount };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [cartBounce, setCartBounce] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const items = JSON.parse(stored) as CartItem[];
        setCart(calculateTotals(items));
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  const persistCart = useCallback((items: CartItem[]) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    setCart(calculateTotals(items));
  }, []);

  const addItem = useCallback(
    (newItem: Omit<CartItem, "id">) => {
      setCart((prev) => {
        const existingIndex = prev.items.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.variantId === newItem.variantId
        );

        let updatedItems: CartItem[];
        if (existingIndex >= 0) {
          updatedItems = [...prev.items];
          const existing = updatedItems[existingIndex];
          const newQty = Math.min(
            existing.quantity + newItem.quantity,
            newItem.maxQuantity
          );
          updatedItems[existingIndex] = { ...existing, quantity: newQty };
        } else {
          updatedItems = [
            ...prev.items,
            { ...newItem, id: `${newItem.productId}-${newItem.variantId || "default"}` },
          ];
        }

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
        setCartBounce((b) => b + 1);
        toast.custom(() => (
          <CartToast
            name={newItem.name}
            imageUrl={newItem.imageUrl}
            quantity={newItem.quantity}
          />
        ), { duration: 2500 });
        return calculateTotals(updatedItems);
      });
    },
    []
  );

  const removeItem = useCallback(
    (productId: string, variantId?: string) => {
      setCart((prev) => {
        const updatedItems = prev.items.filter(
          (item) =>
            !(item.productId === productId && item.variantId === variantId)
        );
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
        toast.success("Removed from cart");
        return calculateTotals(updatedItems);
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      setCart((prev) => {
        const updatedItems = prev.items.map((item) => {
          if (item.productId === productId && item.variantId === variantId) {
            return { ...item, quantity: Math.max(1, Math.min(quantity, item.maxQuantity)) };
          }
          return item;
        });
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
        return calculateTotals(updatedItems);
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    localStorage.removeItem(CART_STORAGE_KEY);
    setCart(emptyCart);
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateQuantity, clearCart, itemCount: cart.itemCount, cartBounce }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

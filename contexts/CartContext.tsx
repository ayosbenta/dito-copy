
import React, { createContext, useState } from 'react';
import { CartContextType, CartItem, Product } from '../types';

export const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  cartTotal: 0,
  discountAmount: 0,
  itemCount: 0,
  clearCart: () => {},
  isCartOpen: false,
  setIsCartOpen: () => {},
});

// Helper to calculate price with discounts
const calculateDiscountedPrice = (item: CartItem) => {
  let finalPrice = item.price;
  let appliedDiscount = 0;

  if (item.bulkDiscounts && item.bulkDiscounts.length > 0) {
    // Sort discounts by minQty descending to find the highest applicable tier
    const sortedDiscounts = [...item.bulkDiscounts].sort((a, b) => b.minQty - a.minQty);
    const applicableTier = sortedDiscounts.find(d => item.quantity >= d.minQty);
    
    if (applicableTier) {
      appliedDiscount = item.price * (applicableTier.percentage / 100);
      finalPrice = item.price - appliedDiscount;
    }
  }
  
  return { finalPrice, appliedDiscount };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      const stock = product.stock ?? 0;

      if (stock <= 0) return prev; // Don't add if no stock

      if (existing) {
        // Check if adding 1 more exceeds stock
        if (existing.quantity + 1 > stock) {
          return prev; // Do nothing (or optionally trigger a notification)
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      
      // New Item
      if (stock < 1) return prev;
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return removeFromCart(id);
    
    setCartItems(prev => prev.map(item => {
       if (item.id === id) {
         // Check limit again just in case
         const stock = item.stock ?? 0;
         if (qty > stock) return { ...item, quantity: stock };
         return { ...item, quantity: qty };
       }
       return item;
    }));
  };

  const clearCart = () => setCartItems([]);

  // Calculate totals
  const { total, totalDiscount } = cartItems.reduce((acc, item) => {
    const { finalPrice, appliedDiscount } = calculateDiscountedPrice(item);
    return {
      total: acc.total + (finalPrice * item.quantity),
      totalDiscount: acc.totalDiscount + (appliedDiscount * item.quantity)
    };
  }, { total: 0, totalDiscount: 0 });

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items: cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      cartTotal: total, 
      discountAmount: totalDiscount, 
      itemCount, 
      clearCart,
      isCartOpen,
      setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
};

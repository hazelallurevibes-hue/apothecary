import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartLineKey, computeLinePrice, formatOptionsSummary, parseItemOptions } from '../lib/itemOptions';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('Hazel Allure_cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        setCart([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('Hazel Allure_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    const optionGroups = parseItemOptions(item.item_options);
    const selectedOptions = item.selectedOptions || {};
    const linePrice = item.linePrice ?? computeLinePrice(item.price, optionGroups, selectedOptions);
    const optionsSummary = item.optionsSummary ?? formatOptionsSummary(optionGroups, selectedOptions);
    const line = {
      ...item,
      item_options: optionGroups,
      selectedOptions,
      linePrice,
      optionsSummary,
      cartId: item.cartId || Date.now() + Math.random(),
      qty: item.qty || 1,
    };
    const key = cartLineKey(line);

    setCart((prev) => {
      const existing = prev.findIndex((i) => cartLineKey(i) === key);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          qty: (updated[existing].qty || 1) + (item.qty || 1),
        };
        return updated;
      }
      return [...prev, line];
    });
  };

  const addUpsellToCart = (upsell, vendorId) => {
    addToCart({
      id: `upsell-${upsell.id}`,
      upsellId: upsell.id,
      name: upsell.name,
      price: upsell.price,
      linePrice: upsell.price,
      vendor_id: vendorId,
      isUpsell: true,
      type: 'upsell',
      category: upsell.category,
    });
  };

  const removeFromCart = (cartId) => {
    setCart((prev) => {
      const item = prev.find((i) => i.cartId === cartId);
      if (item && (item.qty || 1) > 1) {
        return prev.map((i) =>
          i.cartId === cartId ? { ...i, qty: (i.qty || 1) - 1 } : i,
        );
      }
      return prev.filter((i) => i.cartId !== cartId);
    });
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce(
    (sum, item) => sum + (item.linePrice ?? item.price ?? 0) * (item.qty || 1),
    0,
  );

  const formatCartLineName = (item) => {
    const base = item.name;
    if (item.optionsSummary) return `${base} (${item.optionsSummary})`;
    if (item.isUpsell) return `${base} (add-on)`;
    return base;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addUpsellToCart,
        removeFromCart,
        clearCart,
        total,
        formatCartLineName,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
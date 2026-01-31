// context/CartContext.jsx
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cart_v1");
    return saved ? JSON.parse(saved) : [];
  });

  const addToCart = (product) => {
    setCartItems(prev => {
      const exist = prev.find(item => item.id === product.id);
      let updated;
      if (exist) {
        updated = prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prev, { ...product, quantity: 1 }];
      }
      localStorage.setItem("cart_v1", JSON.stringify(updated));
      return updated;
    });
  };

  const increase = (id) => {
    setCartItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
      localStorage.setItem("cart_v1", JSON.stringify(updated));
      return updated;
    });
  };

  const decrease = (id) => {
    setCartItems(prev => {
      const updated = prev
        .map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item)
        .filter(item => item.quantity > 0);
      localStorage.setItem("cart_v1", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem("cart_v1", JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart_v1");
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, increase, decrease, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

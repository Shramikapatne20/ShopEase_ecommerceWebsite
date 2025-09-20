import React, { createContext, useState, useEffect,useCallback } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const userId = localStorage.getItem("user_id");

  // ✅ Fetch cart from backend
const fetchCart = useCallback(async () => {
  if (!userId) return;
  try {
    const res = await axios.get(`http://localhost:3000/api/cart/${userId}`);
    setCartItems(res.data || []);
  } catch (err) {
    console.error(err);
  }
}, [userId]);

useEffect(() => {
  fetchCart();
}, [fetchCart]);

  return (
    <CartContext.Provider value={{ cartItems, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

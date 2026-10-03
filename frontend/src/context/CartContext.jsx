import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { cartApi, errorMessage } from '../services/api';
import { useAppAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoaded, isSignedIn } = useAppAuth();
  const toast = useToast();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setCart(await cartApi.get());
    } catch {
      setCart({ items: [] });
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [isLoaded, isSignedIn, refresh]);

  // Runs a cart API call, stores the returned cart, and reports errors as toasts.
  const run = async (call, successMessage) => {
    try {
      setCart(await call());
      if (successMessage) toast.success(successMessage);
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
    }
  };

  const items = cart.items || [];
  const value = {
    cart,
    items,
    loading,
    count: items.reduce((n, i) => n + i.quantity, 0),
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    addToCart: (productId, quantity = 1) => run(() => cartApi.add(productId, quantity), 'Added to cart'),
    updateQuantity: (productId, quantity) => run(() => cartApi.update(productId, quantity)),
    removeItem: (productId) => run(() => cartApi.remove(productId), 'Removed from cart'),
    clearCart: async () => {
      try {
        await cartApi.clear();
        setCart({ items: [] });
      } catch (err) {
        toast.error(errorMessage(err));
      }
    },
    refresh,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);

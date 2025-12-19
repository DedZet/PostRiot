import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
  // При загрузке пытаемся достать корзину из localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('post_riot_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Каждый раз, когда корзина меняется, сохраняем её
  useEffect(() => {
    localStorage.setItem('post_riot_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    // Проверяем, есть ли уже такой товар с таким же размером
    setCart(prev => [...prev, { ...product, quantity: 1 }]);
  }

  const removeFromCart = (index) => {
    setCart(prev => {
      const newCart = [...prev];
      newCart.splice(index, 1);
      return newCart;
    });
  }

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}
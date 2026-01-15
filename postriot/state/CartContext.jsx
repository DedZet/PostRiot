import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
  // При загрузке пытаемся достать корзину из localStorage с обработкой ошибок
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('post_riot_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Ошибка при загрузке корзины из localStorage:', error);
      return [];
    }
  });

  // Каждый раз, когда корзина меняется, сохраняем её
  useEffect(() => {
    try {
      localStorage.setItem('post_riot_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Ошибка при сохранении корзины в localStorage:', error);
    }
  }, [cart]);

  const addToCart = (product) => {
    // Проверяем, что product существует и имеет обязательные поля
    if (!product || !product.id || !product.name || !product.price) {
      console.warn('Попытка добавить невалидный товар в корзину:', product);
      return; // Прекращаем выполнение, если товар невалидный
    }

    // Проверяем, есть ли уже такой товар с таким же размером
    setCart(prev => [...prev, { ...product, quantity: 1 }]);
  }

  const removeFromCart = (index) => {
    // Проверяем валидность индекса
    if (index === null || index === undefined || 
        typeof index !== 'number' || 
        index < 0 || 
        index >= cart.length || 
        !Number.isInteger(index)) {
      console.warn('Попытка удалить товар с невалидным индексом:', index);
      return; // Прекращаем выполнение, если индекс невалидный
    }

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
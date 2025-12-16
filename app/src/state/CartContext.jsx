import { createContext, useContext, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const CartContext = createContext()
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  const addToCart = (product) => {
    const cartItem = {
      ...product,
      cartId: uuidv4()
    }
    setCart(prev => [...prev, cartItem])
  }

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId))
  }

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}
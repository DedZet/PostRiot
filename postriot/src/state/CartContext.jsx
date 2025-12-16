import { createContext, useContext, useState } from 'react'


const CartContext = createContext()
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
const [cart, setCart] = useState([])


const addToCart = (product) => {
setCart(prev => [...prev, product])
}


const removeFromCart = (index) => {
  setCart(prevCart => {
    const newCart = [...prevCart]
    newCart.splice(index, 1)
    return newCart
  })
}


const clearCart = () => setCart([])


return (
<CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
{children}
</CartContext.Provider>
)
}
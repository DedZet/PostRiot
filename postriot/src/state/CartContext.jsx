import { createContext, useContext, useState } from 'react'


const CartContext = createContext()
export const useCart = () => useContext(CartContext)


export function CartProvider({ children }) {
const [cart, setCart] = useState([])


const addToCart = (product) => {
setCart(prev => [...prev, product])
}


const removeFromCart = (id) => {
setCart(prev => prev.filter(item => item.id !== id))
}


const clearCart = () => setCart([])


return (
<CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
{children}
</CartContext.Provider>
)
}
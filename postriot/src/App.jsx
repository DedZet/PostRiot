import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import Header from './components/Header'
import CartPanel from './components/CartPanel'
import { useState } from 'react'


export default function App() {
const [showCart, setShowCart] = useState(false)


return (
<>
<Header openCart={() => setShowCart(true)} />
<CartPanel show={showCart} close={() => setShowCart(false)} />


<Routes>
<Route path="/" element={<HomePage />} />
<Route path="/product/:id" element={<ProductPage />} />
</Routes>
</>
)
}
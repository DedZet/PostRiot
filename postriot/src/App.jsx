import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import CartPanel from './components/CartPanel'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentSuccess from './pages/PaymentSuccess'
import Footer from './components/Footer'

export default function App() {
  const [showCart, setShowCart] = useState(false)

  return (
    <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header openCart={() => setShowCart(true)} />
      
      <CartPanel show={showCart} close={() => setShowCart(false)} />

      {/* Основной контент, который "расталкивает" шапку и футер */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
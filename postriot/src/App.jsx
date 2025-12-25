import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage'; // БЕЗ фигурных скобок
import Header from './components/Header';
import CartPanel from './components/CartPanel';

export default function App() {
  const [showCart, setShowCart] = useState(false);

  return (
    <>
      <Header openCart={() => setShowCart(true)} />
      <CartPanel show={showCart} close={() => setShowCart(false)} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </>
  );
}
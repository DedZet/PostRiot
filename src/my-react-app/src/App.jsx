import React, { useState } from "react";
import "./App.css";
import products from "./products"; // импорт массива товаров

export default function App() {
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const handleProductClick = (product) => {
    console.log("Clicked product:", product);
    // позже здесь появится открытие страницы товара или добавление в корзину
  };

  return (
    <div className="page-container">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          POST<br />RIOT
        </div>

        <div className="nav-icons">
          <button className="icon-btn" onClick={() => setShowSearch(!showSearch)}>
            <img src="/public/search.svg" alt="search" />
          </button>

          <button className="icon-btn" onClick={() => setShowCart(!showCart)}>
            <img src="/public/cart.svg" alt="cart" />
          </button>
        </div>
      </header>

      {/* SEARCH DROPDOWN */}
      {showSearch && (
        <div className="search-dropdown">
          <input type="text" placeholder="Search..." />
        </div>
      )}

      {/* CART PANEL */}
      <div className={`cart-panel ${showCart ? "open-cart" : ""}`}>
        <h2>Корзина</h2>
        <p>Здесь появятся товары...</p>
      </div>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="product-grid">
          {products.map((product) => (
            <button
              key={product.id}
              className="product-card"
              onClick={() => handleProductClick(product)}
            >
              <img
                className="product-image"
                src={product.image}
                alt={product.name}
              />

              <div className="card-details-placeholder">
                <p>{product.name}</p>
                <p>{product.price}</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        © 2025 POST RIOT — Coming soon
      </footer>
    </div>
  );
}

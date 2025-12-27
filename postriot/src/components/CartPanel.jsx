import { useCart } from '../state/CartContext'
import { Link } from 'react-router-dom'

export default function CartPanel({ show, close }) {
  const { cart, removeFromCart } = useCart()

  const handleRemoveFromCart = (index) => {
    removeFromCart(index)
  }

  return (
    <>
      {/* Затемнение фона */}
      <div 
        className={`cart-overlay ${show ? 'open' : ''}`}
        onClick={close} 
      />
      
      {/* Сама панель */}
      <div className={`cart-panel ${show ? 'open' : ''}`}>
        
        <div className="cart-header">
          <h2>ВАША КОРЗИНА</h2>
          <button onClick={close} className="close-btn">✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {cart.length === 0 && (
            <p style={{ color: "#555", marginTop: "40px", textAlign: "center" }}>
              ПУСТО
            </p>
          )}

          {cart.map((item, index) => (
            <div key={`${item.id}-${index}-${item.size}`} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <p style={{ fontWeight: "bold" }}>{item.name}</p>
                  <p>{item.price}₽</p>
                </div>
                <p style={{ color: "#666", fontSize: "14px", marginTop: "6px" }}>
                  Size: {item.size}
                </p>
                <button 
                  onClick={() => handleRemoveFromCart(index)} 
                  className="remove-btn">
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
        <Link to="/checkout" className="checkout-btn-link" onClick={() => setIsOpen(false)}>
        <button className="checkout-btn">ОФОРМИТЬ ЗАКАЗ</button>
        </Link>
      )}
      </div>
    </>
  )
}
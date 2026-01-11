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

        <div className="cart-items-container">
          {cart.length === 0 && (
            <p className="cart-empty">ПУСТО</p>
          )}

          {cart.map((item, index) => (
            <div key={`${item.id}-${index}-${item.size}`} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="cart-item-details">
                <div className="cart-item-header">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-price">{item.price}₽</p>
                </div>
                <p className="cart-item-size">
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
          <Link to="/checkout" className="checkout-btn-link" onClick={close}>
            <button className="checkout-btn">ОФОРМИТЬ ЗАКАЗ</button>
          </Link>
        )}
      </div>
    </>
  )
}
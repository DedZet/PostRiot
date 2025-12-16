import { useCart } from '../state/CartContext'

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
          <h2>YOUR CART</h2>
          <button onClick={close} className="close-btn">✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {cart.length === 0 && (
            <p style={{ color: "#555", marginTop: "40px", textAlign: "center" }}>
              EMPTY VOID
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
                <p style={{ color: "#666", fontSize: "14px", marginTop: "5px" }}>
                  Size: {item.size}
                </p>
                <button 
                  onClick={() => handleRemoveFromCart(index)} 
                  className="remove-btn"
                >
                  REMOVE
                </button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <button className="checkout-btn">
            CHECKOUT
          </button>
        )}
      </div>
    </>
  )
}
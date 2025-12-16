import { Link } from 'react-router-dom'
import { useCart } from '../state/CartContext'

import CartIcon from '/cart.svg' 

export default function Header({ openCart }) {
  const { cart } = useCart()

  return (
    <header className="header">
      <Link to="/" className="logo">
        POST RIOT
      </Link>
      <button onClick={openCart} className="cart-btn-icon">
        <img src={CartIcon} alt="Cart" className="cart-svg" />
        {cart.length > 0 && (
          <span className="cart-count">{cart.length}</span>
        )}
      </button>
    </header>
  )
}
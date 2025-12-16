import { Link } from 'react-router-dom'
import { products } from '../products'

export default function HomePage() {
  return (
    <div className="product-grid">
      {products.map(prod => (
        <Link key={prod.id} to={`/product/${prod.id}`}>
          <div className="product-card">
            <img src={prod.image} alt={prod.name} />
            <div className="card-info">
              <h3>{prod.name}</h3>
              <span className="card-price">{prod.price}₽</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
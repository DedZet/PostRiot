import { useParams } from 'react-router-dom'
import { products } from '../products'
import { useState } from 'react'
import { useCart } from '../state/CartContext'

export default function ProductPage() {
  const { id } = useParams()
  const product = products.find(p => p.id === Number(id))
  const [size, setSize] = useState(product.sizeList[0])
  const { addToCart } = useCart()

  if (!product) return <div>Товар не найден</div>

  return (
    <div className="product-page">
      <div className="product-image-large">
        <img src={product.image} style={{ width: "100%" }} alt={product.name} />
      </div>

      <div className="product-details">
        <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>{product.name}</h1>
        <p style={{ color: "#8a0000", fontSize: "1.5rem", marginBottom: "30px" }}>
          {product.price}₽
        </p>

        <div className="size-selector">
          <p style={{ marginBottom: "10px", color: "#888" }}>Указать размер:</p>
          {product.sizeList.map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`size-btn ${size === s ? 'active' : ''}`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={() => addToCart({ ...product, size })}
          className="add-btn"
        >
          ДОБАВИТЬ В КОРЗИНУ
        </button>
      </div>
    </div>
  )
}
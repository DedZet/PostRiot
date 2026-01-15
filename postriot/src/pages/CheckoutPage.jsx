import { useState, useEffect } from 'react';
import { useCart } from '../state/CartContext';
import '../index.css';
import ReCAPTCHA from 'react-google-recaptcha';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    cdekPoint: '',
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
    setTotalPrice(total);
  }, [cart]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCaptchaSuccess = () => setIsCaptchaVerified(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isCaptchaVerified) return;

    try {
      // PostgreSQL
      const orderResponse = await fetch('http://localhost:5000/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          city: formData.city,
          cdekPoint: formData.cdekPoint,
          totalPrice: totalPrice
        }),
      });

      if (!orderResponse.ok) throw new Error('DB Error');
      const savedOrder = await orderResponse.json();

      // YooKassa
      const paymentResponse = await fetch("http://localhost:5000/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalPrice.toFixed(2),
          description: `Заказ №${savedOrder.id} от ${formData.name}`,
          orderId: savedOrder.id
        })
      });

      if (!paymentResponse.ok) {
        throw new Error('Payment creation failed');
      }

      const paymentData = await paymentResponse.json();
      
      if (paymentData.confirmationUrl) {
        clearCart();
        window.location.href = paymentData.confirmationUrl;
      } else {
        console.error('No confirmation URL in response:', paymentData);
      }

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Ошибка при оформлении заказа: ' + error.message);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="empty-checkout" style={{ textAlign: 'center', padding: '100px' }}>
        <h2 style={{ letterSpacing: '2px' }}>ВАША КОРЗИНА ПУСТА</h2>
        <p style={{ color: '#555', marginTop: '10px' }}>ВЕРНИТЕСЬ В МАГАЗИН ЧТОБЫ ПОПОЛНИТЬ ЕЁ</p>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-container">
        <div className="checkout-form-section">
          <h2>DELIVERY INFO</h2>
          <form onSubmit={handleSubmit} className="riot-form">
            <div className="form-group">
              <label>ИМЯ *</label>
              <input type="text" name="name" onChange={handleInputChange} required placeholder="АНДРЕЙ КУЗНЕЦОВ" />
            </div>
            <div className="form-group">
              <label>ЭЛ. ПОЧТА *</label>
              <input type="email" name="email" onChange={handleInputChange} required placeholder="KING@MAIL.COM" />
            </div>
            <div className="form-group">
              <label>ГОРОД *</label>
              <input type="text" name="city" onChange={handleInputChange} required placeholder="МОСКВА" />
            </div>
            <div className="form-group">
              <label>ПОЛНЫЙ АДРЕС *</label>
              <input type="text" name="cdekPoint" onChange={handleInputChange} required placeholder="ГАГАРИНА 78" />
            </div>
            
            <div className="captcha-wrapper">
              <ReCAPTCHA 
                theme="dark"
                sitekey='6Lf1YC4sAAAAAI36nMQ2Cen7I-7SCwo2V7RTa8kT' 
                onChange={handleCaptchaSuccess}
              />
            </div>

            <button type="submit" className="payment-submit-btn" disabled={!isCaptchaVerified}>
              ПЕРЕЙТИ К ОПЛАТЕ — {totalPrice}₽
            </button>
          </form>
        </div>

        <div className="order-summary-section">
          <h2>ВАШ ЗАКАЗ</h2>
          <div className="order-items-list">
            {cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="checkout-item">
                <img src={item.image} alt={item.name} />
                <div className="checkout-item-info">
                  <h4>{item.name}</h4>
                  <span>РАЗМЕР: {item.size}</span>
                  <p>{item.price}₽</p>
                </div>
              </div>
            ))}
          </div>
          <div className="checkout-total">
            <span>ВСЕГО:</span>
            <span>{totalPrice}₽</span>
          </div>
        </div>
      </div>
    </div>
  );
}
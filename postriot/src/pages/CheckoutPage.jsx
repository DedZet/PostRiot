import { useState, useEffect } from 'react';
import { useCart } from '../state/CartContext';
import '../index.css';

import ReCAPTCHA from 'react-google-recaptcha';

import { ICreatePayment, YooCheckout } from '@a2seven/yoo-checkout'; // npm i @a2seven/yoo-checkout

const checkout = new YooCheckout({
  shopId: '1232574', 
  secretKey: 'test_az5Uhh4Fo19NyDQ8IlpsXAA-jL_7QlhnxhyFWE_n9tI',
});

export default function CheckoutPage() {
  const { cart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    cdekPoint: '',
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  useEffect(() => {
    // Считаем сумму просто складывая цены всех объектов в массиве
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

      const response = await fetch('http://localhost:5000/api/create-order', {
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

      if (!response.ok) throw new Error('DB Error');
      const savedOrder = await response.json();

    ////////////// Yookassa begin
      
    const createPayload = {
        amount: {
          value: totalPrice.toFixed(2), // Используем реальную сумму из корзины
          currency: 'RUB'
        },
        payment_method_data: {
          type: 'bank_card'
        },
        confirmation: {
          type: 'redirect',
          return_url: `${window.location.origin}/payment-success` // Используем реальный URL
        },
        description: `Заказ №${savedOrder.id}`, // Добавляем описание с номером заказа
        capture: true, // Автоматическое списание средств
        metadata: {
          orderId: savedOrder.id // Сохраняем ID заказа в метаданных
        }
      };

      // Генерируем уникальный ключ идемпотентности
      const idempotenceKey = `order_${savedOrder.id}_${Date.now()}`;

      try {
        const payment = await checkout.createPayment(createPayload, idempotenceKey);
        console.log('Payment created:', payment);
        
        // Перенаправляем пользователя на страницу оплаты
        if (payment.confirmation && payment.confirmation.confirmation_url) {
          window.location.href = payment.confirmation.confirmation_url;
        }
      } catch (error) {
        console.error('Payment error:', error);
        alert('Ошибка при создании платежа. Попробуйте еще раз.');
      }

    } catch (err) {
      console.error(err);
      alert('Ошибка при создании заказа. Проверьте, запущен ли сервер node index.js');
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="empty-checkout" style={{ textAlign: 'center', padding: '100px' }}>
        <h2 style={{ letterSpacing: '2px' }}>YOUR VOID IS EMPTY</h2>
        <p style={{ color: '#555', marginTop: '10px' }}>RETURN TO THE SHOP TO FILL IT.</p>
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
              <label>NAME *</label>
              <input type="text" name="name" onChange={handleInputChange} required placeholder="YOUR NAME" />
            </div>
            <div className="form-group">
              <label>EMAIL *</label>
              <input type="email" name="email" onChange={handleInputChange} required placeholder="EXAMPLE@MAIL.COM" />
            </div>
            <div className="form-group">
              <label>CITY *</label>
              <input type="text" name="city" onChange={handleInputChange} required placeholder="MOSCOW" />
            </div>
            <div className="form-group">
              <label>CDEK POINT *</label>
              <input type="text" name="cdekPoint" onChange={handleInputChange} required placeholder="ADDRESS" />
            </div>
            
            <div className="captcha-wrapper">
              <ReCAPTCHA 
                theme="dark"
                sitekey='6Lf1YC4sAAAAAI36nMQ2Cen7I-7SCwo2V7RTa8kT' 
                onChange={handleCaptchaSuccess}
              />
            </div>

            <button type="submit" className="payment-submit-btn" disabled={!isCaptchaVerified}>
              PROCEED TO PAYMENT — {totalPrice}₽
            </button>
          </form>
        </div>

        <div className="order-summary-section">
          <h2>YOUR ORDER</h2>
          <div className="order-items-list">
            {cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="checkout-item">
                <img src={item.image} alt={item.name} />
                <div className="checkout-item-info">
                  <h4>{item.name}</h4>
                  <span>SIZE: {item.size}</span>
                  <p>{item.price}₽</p>
                </div>
              </div>
            ))}
          </div>
          <div className="checkout-total">
            <span>TOTAL:</span>
            <span>{totalPrice}₽</span>
          </div>
        </div>
      </div>
    </div>
  );
}
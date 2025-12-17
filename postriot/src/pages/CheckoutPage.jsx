import { useState, useEffect } from 'react';
import { useCart } from '../state/CartContext';
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

  useEffect(() => {
    const total = cart.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    setTotalPrice(total);
  }, [cart]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // валидация и отправка данных на сервер
  
    const paymentData = {
      receiver: '0000000000000000', // Номер кошелька YooMoney
      sum: totalPrice,
      label: `Заказ от ${formData.name} (${formData.email})`,
      targets: `Оплата заказа из интернет-магазина`,
      formcomment: 'Интернет-магазин',
      shortDest: 'Оплата заказа',
      comment: `Доставка: ${formData.city}, ${formData.cdekPoint}`,
      quickpayForm: 'shop',
      successURL: `${window.location.origin}/success`,
      needFio: false,
      needEmail: true,
      needPhone: false,
      needAddress: false
    };

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://yoomoney.ru/quickpay/confirm.xml';
    
    Object.keys(paymentData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
    //clearCart();
  };

  // if (cart.length === 0) {
  //   return (
  //     <div className="checkout-page">
  //       <h2>Ваша корзина пуста</h2>
  //       <p>Добавьте товары в корзину для оформления заказа</p>
  //     </div>
  //   );
  // }

const [captchaStatus, setCaptchaStatus] = useState(false);
const onSuccess = (key) => {
  setCaptchaStatus(true);
};

  return (
    <>
      <div className="checkout-container">
        <div className="order-summary">
          <h2>Ваш заказ</h2>
          <div className="order-items">
            {cart.map(item => (
              <div key={`${item.id}-${item.size}`} className="order-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Размер: {item.size}</p>
                  <p>Количество: {item.quantity}</p>
                  <p className="item-price">{item.price * item.quantity}₽</p>
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <h3>Итого: {totalPrice}₽</h3>
          </div>
        </div>

        <div className="checkout-form">
          <h2>Данные для доставки</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Имя *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Введите ваше имя"
              />
            </div>
            
            
            <div className="form-group">
              <label htmlFor="email">Электронная почта *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="example@mail.ru"
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">Город *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                placeholder="Москва"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cdekPoint">Пункт выдачи СДЭК *</label>
              <input
                type="text"
                id="cdekPoint"
                name="cdekPoint"
                value={formData.cdekPoint}
                onChange={handleInputChange}
                required
                placeholder="Введите адрес пункта выдачи"
              />
            </div>

            <div className="form-note">
              <p>* После оплаты с вами свяжется менеджер для подтверждения деталей заказа</p>
            </div>
            
            <ReCAPTCHA sitekey='6Lf1YC4sAAAAAI36nMQ2Cen7I-7SCwo2V7RTa8kT' onchange={onSuccess} />
            <button type="submit" className="payment-btn">Перейти к оплате {totalPrice}₽</button>
          </form>
        </div>
      </div>
    </>
  );
}
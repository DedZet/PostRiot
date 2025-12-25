import React, { useEffect } from 'react';

export default function PaymentSuccess() {
  useEffect(() => {
    // Проверяем статус платежа при загрузке страницы
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get('paymentId');
      
      // Запрос к вашему серверу для проверки статуса
      // и обновления заказа
    };
    
    checkPaymentStatus();
  }, []);
  
  return <div>Оплата успешно завершена!</div>;
}
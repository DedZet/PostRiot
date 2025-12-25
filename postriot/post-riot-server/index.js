require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // Первым подключаем CORS
app.use(bodyParser.json()); // Затем bodyParser


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'post_riot_db',
  password: '303adminriot!', // 123qwe123qwe
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к БД', err.stack);
  } else {
    console.log('Успешное подключение к PostgreSQL');
  }
});

// Маршрут создания заказа (должен быть перед маршрутом оплаты, если используется)
app.post('/api/create-order', async (req, res) => {
  const { name, email, city, cdekPoint, totalPrice } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO orders (customer_name, email, city, cdek_point, total_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, city, cdekPoint, totalPrice]
    );
    
    res.json(result.rows[0]);
    console.log('Новый заказ создан:', result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Маршрут создания платежа (исправленный)
app.post('/api/payment', async (req, res) => {
  try {
    // Получаем данные из запроса
    const { amount, description, orderId } = req.body;
    
    // Проверяем обязательные поля
    if (!amount || !description) {
      return res.status(400).json({ error: 'Amount and description are required' });
    }

    const shopId = '1232574'; // Ваш shopId
    const secretKey = 'test_az5Uhh4Fo19NyDQ8IlpsXAA-jL_7QlhnxhyFWE_n9tI'; // Ваш секретный ключ
    const idempotenceKey = crypto.randomUUID();

    const response = await axios.post(
      'https://api.yookassa.ru/v3/payments',
      {
        amount: {
          value: amount,
          currency: 'RUB'
        },
        capture: true,
        description: description,
        confirmation: {
          type: 'redirect',
          return_url: 'http://localhost:5173/payment-success'
        },
        metadata: {
          orderId: orderId || null
        }
      },
      {
        auth: {
          username: shopId,
          password: secretKey
        },
        headers: {
          'Idempotence-Key': idempotenceKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Платеж создан',
      confirmationUrl: response.data.confirmation.confirmation_url,
      paymentId: response.data.id,
      amount: amount,
      description: description,
      testMode: true
    });
    
  } catch (error) {
    console.error('Payment error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Payment creation failed',
      details: error.response?.data || error.message 
    });
  }
});

// Маршрут проверки статуса платежа
app.get('/api/payment/:id/status', async (req, res) => {
  try {
    const shopId = '1232574'; // Ваш shopId
    const secretKey = 'test_az5Uhh4Fo19NyDQ8IlpsXAA-jL_7QlhnxhyFWE_n9tI'; // Ваш секретный ключ
    
    const response = await axios.get(
      `https://api.yookassa.ru/v3/payments/${req.params.id}`,
      {
        auth: {
          username: shopId,
          password: secretKey
        }
      }
    );
    
    res.json({ status: response.data.status });
  } catch (error) {
    console.error('Status check error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to get payment status',
      details: error.response?.data || error.message 
    });
  }
});

// Тестовый маршрут для проверки работы сервера
app.get('/api/test', (req, res) => {
  res.json({ message: 'Сервер работает!' });
});

app.get('/', (req, res) => {
  res.send('Post Riot Server is running');
});

// УБЕРИТЕ ДУБЛИРУЮЩИЙ ВЫЗОВ app.listen()!
// Оставляем только один вызов:
app.listen(port, () => {
  console.log(`Сервер Post Riot запущен на порту ${port}`);
  console.log(`   GET  http://localhost:${port}/`);
  console.log(`   GET  http://localhost:${port}/api/test`);
  console.log(`   POST http://localhost:${port}/api/payment`);
  console.log(`   POST http://localhost:${port}/api/create-order`);
});
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000;

// Разрешаем запросы с твоего React сайта (обычно он на порту 5173 или 3000)
app.use(cors());
app.use(bodyParser.json());

// Настройки подключения к базе
const pool = new Pool({
  user: 'postgres',        // Имя пользователя (по умолчанию postgres)
  host: 'localhost',       // Сервер локальный
  database: 'post_riot_db', // Имя базы, которую мы создали
  password: '123qwe123qwe', 
  port: 5432,
});

// Проверка подключения
pool.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к БД', err.stack);
  } else {
    console.log('Успешное подключение к PostgreSQL');
  }
});

// Эндпоинт (адрес), куда React будет присылать заказ
app.post('/api/create-order', async (req, res) => {
  const { name, email, city, cdekPoint, totalPrice } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO orders (customer_name, email, city, cdek_point, total_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, city, cdekPoint, totalPrice]
    );
    
    // Отправляем обратно созданный заказ
    res.json(result.rows[0]);
    console.log('Новый заказ создан:', result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
  console.log(`Сервер Post Riot запущен на порту ${port}`);
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express(); // ← これを最初に定義！

const PORT = process.env.PORT || 5000;

// CORS設定（必要に応じて緩く設定）
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // フロントエンドのURLを指定
    credentials: true,
  })
)

// ミドルウェア
app.use(express.json());

// テストルート
app.get('/', (req, res) => {
  res.send('API is running');
});

// DB接続
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,         // ⚠️ これらは警告が出ているので、将来的には削除OK
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => console.error(err));

// 認証ルート
const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);

// Todoルート
const todoRoute = require('./routes/todos');
app.use('/api/todos', todoRoute);

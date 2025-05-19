import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css'; // 共通CSSを適用する想定'
import fetchService from '../../fetchService';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await fetchService.post('/api/auth/register', {
        username,
        email,
        password,
      });
      toast.success('登録成功！ログインしてください。');
      window.location.href = '/login'; // 登録後にログイン画面へ
    } catch (err) {
      console.error('登録エラー:', err.response?.data || err.message);
      toast.error('登録に失敗しました。メールアドレスが既に使用されている可能性があります。');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleRegister} className="login-form">
        <h2 className="login-title">ユーザー登録</h2>
        <input
          type="text"
          className="login-input"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="ユーザー名"
          required
        />
        <input
          type="email"
          className="login-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="メールアドレス"
          required
        />
        <input
          type="password"
          className="login-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="パスワード"
          required
        />
        <button type="submit" className="login-button">登録</button>
      </form>
    </div>
  );

}

export default Register;
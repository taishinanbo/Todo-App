import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5050/api/auth/login', {
        email,
        password,
      });

      const token = res.data.token;
      if (token) {
        // トークンを保存してからページ遷移（完全リロード）
        localStorage.setItem('token', token);
        console.log('保存されたトークン:', token);
        window.location.href = '/'; // Reactのnavigateより確実
      } else {
        console.error('トークンが返されませんでした。');
        alert('ログインに失敗しました（トークン未取得）');
      }
    } catch (err) {
      console.error('ログインエラー:', err.response?.data || err.message);
      alert('ログインに失敗しました');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
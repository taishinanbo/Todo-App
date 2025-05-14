import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        localStorage.setItem('token', token);
        toast.success('ログイン成功！ようこそ🎉');
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        toast.error('トークンが取得できませんでした。');
      }
    } catch (err) {
      console.error('ログインエラー:', err.response?.data || err.message);
      toast.error('ログインに失敗しました。メールまたはパスワードを確認してください。');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="login-title">ログイン</h2>
        <input
          type="email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          required
        />
        <input
          type="password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          required
        />
        <button type="submit" className="login-button">ログイン</button>
      </form>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}

export default Login;

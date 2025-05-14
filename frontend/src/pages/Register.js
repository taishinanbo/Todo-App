import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; // 共通CSSを適用する想定

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5050/api/auth/register', {
        username,
        email,
        password,
      });
      alert('登録が完了しました。ログインしてください。');
      window.location.href = '/login'; // 登録後にログイン画面へ
    } catch (err) {
      console.error('登録エラー:', err.response?.data || err.message);
      alert('登録に失敗しました。');
    }
  };

  return (
    <form className="login-container" onSubmit={handleRegister}>
      <h2>ユーザー登録</h2>
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="ユーザー名"
        required
      />
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="メールアドレス"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="パスワード"
        required
      />
      <button type="submit">登録</button>
    </form>
  );
}

export default Register;
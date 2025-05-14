import axios from 'axios';
import { useEffect, useState } from 'react';
import Headerbar
 from '../components/Headerbar';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [token, setToken] = useState(null);

  // 初回トークン取得
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      console.error('トークンが存在しません。ログインが必要です。');
      return;
    }
    setToken(storedToken);
  }, []);

  // ToDo一覧取得
  useEffect(() => {
    if (!token) return;

    const fetchTodos = async () => {
      try {
        const res = await axios.get('http://localhost:5050/api/todos', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTodos(res.data);
      } catch (err) {
        console.error('ToDo取得エラー:', err.response?.data || err.message);
      }
    };

    fetchTodos();
  }, [token]);

  // ToDo追加
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!token || !newTitle.trim()) return;

    try {
      await axios.post('http://localhost:5050/api/todos',
        { title: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTitle('');
      const res = await axios.get('http://localhost:5050/api/todos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(res.data);
    } catch (err) {
      console.error('ToDo作成エラー:', err.response?.data || err.message);
    }
  };

  // 完了トグル
  const toggleTodo = async (todo) => {
    try {
      await axios.put(`http://localhost:5050/api/todos/${todo._id}`, {
        completed: !todo.completed
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const res = await axios.get('http://localhost:5050/api/todos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(res.data);
    } catch (err) {
      console.error('完了状態の切り替えエラー:', err.response?.data || err.message);
    }
  };

  // ToDo削除
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5050/api/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const res = await axios.get('http://localhost:5050/api/todos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(res.data);
    } catch (err) {
      console.error('削除エラー:', err.response?.data || err.message);
    }
  };

  // ログアウト
const handleLogout = () => {
  const confirmLogout = window.confirm('本当にログアウトしますか？');
  if (!confirmLogout) return;

  localStorage.removeItem('token');
  window.location.href = '/login';
};

  return (
    <div>
      <Headerbar />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Todos</h2>
        <button
          onClick={handleLogout}
          style={{
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ログアウト
        </button>
      </div>

      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="新しいToDoを入力"
        />
        <button type="submit">追加</button>
      </form>

      <ul>
        {todos.map(todo => (
          <li key={todo._id} style={{ cursor: 'pointer' }}>
            <span onClick={() => toggleTodo(todo)}>
              {todo.title} {todo.completed ? '✅' : '❌'}
            </span>
            <button
              onClick={() => deleteTodo(todo._id)}
              style={{ marginLeft: '10px' }}
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
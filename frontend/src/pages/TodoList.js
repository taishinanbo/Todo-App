import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState(1);
  const [token, setToken] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState(1);


  // 初回トークン取得
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      toast.error('トークンが見つかりません。ログインしてください。');
      return;
    }
    setToken(storedToken);
  }, []);

  // ToDo取得（初回＋5秒ごと）
  useEffect(() => {
    if (!token) return;
    const fetchTodos = async () => {
      try {
        const res = await axios.get('http://localhost:5050/api/todos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodos(res.data);
      } catch (err) {
        console.error('ToDo取得エラー:', err.response?.data || err.message);
      }
    };

    fetchTodos();
    const interval = setInterval(fetchTodos, 5000); // 5秒ごとに更新

    return () => clearInterval(interval);
  }, [token]);

  // ToDo追加
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!token || !newTitle.trim()) return;

    try {
      const res = await axios.post('http://localhost:5050/api/todos',
        { title: newTitle, priority: newPriority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos((prev) => [...prev, res.data]);
      setNewTitle('');
      setNewPriority(1);
      toast.success('ToDoを追加しました！');
    } catch (err) {
      console.error('ToDo作成エラー:', err.response?.data || err.message);
      toast.error('追加に失敗しました。');
    }
  };

  // 完了トグル
  const toggleTodo = async (todo) => {
    try {
      await axios.put(`http://localhost:5050/api/todos/${todo._id}`,
        { completed: !todo.completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos((prev) =>
        prev.map((t) =>
          t._id === todo._id ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (err) {
      console.error('完了状態の切り替えエラー:', err.response?.data || err.message);
      toast.error('更新に失敗しました。');
    }
  };

  // ToDo削除
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5050/api/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
      toast.success('削除しました。');
    } catch (err) {
      console.error('削除エラー:', err.response?.data || err.message);
      toast.error('削除に失敗しました。');
    }
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://localhost:5050/api/todos/${editId}`, {
        title: editTitle,
        priority: editPriority,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Update list manually
      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === editId ? { ...todo, title: editTitle, priority: editPriority } : todo
        )
      );
  
      toast.success('更新しました！');
      setIsModalOpen(false);
    } catch (err) {
      console.error('編集エラー:', err.response?.data || err.message);
      toast.error('編集に失敗しました。');
    }
  };
  

  const [isFiltered, setIsFiltered] = useState(false);

  const handleFilter = () => {
    // check if filtered or not
    setIsFiltered(!isFiltered);
  }
  const filteredTodos = isFiltered ? todos.filter(todo => !todo.completed) : todos;

  const openEditModal = (todo) => {
    setEditId(todo._id);
    setEditTitle(todo.title);
    setEditPriority(todo.priority);
    setIsModalOpen(true);
  };


  return (
    <div className="todo-container">
      <div className="todo-header">
        <h2>📋 トードゥ リスト</h2>
      </div>

      <form onSubmit={handleAddTodo} className="todo-form">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="新しい事項を追加"
        />
       <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          className="priority-select"
        >
          <option value="1">🟢 低</option>
          <option value="2">🟡 中</option>
          <option value="3">🔴 高</option>
        </select>

        <button type="submit">追加</button>
        <button
          type="button"
          id="filtered-todos"
          onClick={handleFilter}
        >
          {isFiltered ? 'すべて表示' : '完了済みを非表示'}
        </button>

      </form>

      <ul className="todo-list">
        {filteredTodos
          .slice()
          .sort((a, b) => b.priority - a.priority)
          .map((todo) => (
            <li key={todo._id} className="todo-card">
              <span
                onClick={() => toggleTodo(todo)}
                className={todo.completed ? 'completed' : ''}
              >
                {todo.title}
                {todo.priority === 1 && ' 🟢'}
                {todo.priority === 2 && ' 🟡'}
                {todo.priority === 3 && ' 🔴'}
              </span>
              <button onClick={() => openEditModal(todo)}>✏️</button>
              <button onClick={() => deleteTodo(todo._id)}>🗑</button>
            </li>
          ))}
      </ul>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>編集</h3>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="タイトルを編集"
            />
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(Number(e.target.value))}
            >
              <option value={1}>🟢 低</option>
              <option value={2}>🟡 中</option>
              <option value={3}>🔴 高</option>
            </select>
            <div style={{ marginTop: '1rem' }}>
              <button onClick={handleEditSubmit}>保存</button>
              <button onClick={() => setIsModalOpen(false)} style={{ marginLeft: '10px' }}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoList;

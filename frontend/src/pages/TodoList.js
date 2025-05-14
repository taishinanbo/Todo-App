import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaRegUserCircle, FaCheck, FaEdit, FaTrash, FaCreativeCommonsShare } from 'react-icons/fa';

import TodoCard from '../components/TodoCard';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState(1);
  const [token, setToken] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState(1);

  const [editSharedUser, setEditSharedUser] = useState([]); // users with _id, username, email
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserToShare, setSelectedUserToShare] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  // 初回トークン取得
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      toast.error('トークンが見つかりません。ログインしてください。');
      return;
    }
    setToken(storedToken);

    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get('http://localhost:5050/api/todos/currentUser', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setCurrentUserId(res.data.userId);
      } catch (err) {
        console.error('ユーザー取得エラー:', err.response?.data || err.message);
      }
    }
    fetchCurrentUser();
  }, []);

  const openShareModal = async (todo) => {
      setEditId(todo._id);
      setEditSharedUser(todo.sharedWith || []);
      setShareModalOpen(true);

      try {
        const res = await axios.get('http://localhost:5050/api/todos/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllUsers(res.data);
      } catch (err) {
        toast.error('ユーザー一覧の取得に失敗しました');
      }
  };

  const handleAddSharedUser = () => {
  const user = allUsers.find((u) => u._id === selectedUserToShare);
  if (user && !editSharedUser.some((u) => u._id === user._id)) {
    setEditSharedUser((prev) => [...prev, user]);
    setSelectedUserToShare('');
  }
};

const handleRemoveSharedUser = (id) => {
  setEditSharedUser((prev) => prev.filter((u) => u._id !== id));
};

const handleSaveSharedUsers = async () => {
  try {
    const res = await axios.patch(`http://localhost:5050/api/todos/${editId}/share`, {
      sharedWith: editSharedUser.map((u) => u._id)
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success('共有ユーザーを更新しました');
    setShareModalOpen(false);
  } catch (err) {
    toast.error('共有設定の保存に失敗しました');
  }
};

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
        { title: newTitle, description: newDescription, priority: newPriority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos((prev) => [...prev, res.data]);
      setNewTitle('');
      setNewDescription('');
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
        description: editDescription,
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
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority);
    setIsModalOpen(true);
  };

  // const TodoCard = ({ todo, currentUserId, onToggle, onEdit, onDelete, onShare }) => {

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h2>📋 トゥドゥを追加</h2>
      </div>

      <form onSubmit={handleAddTodo} className="todo-form">
        <div className="form-group">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="新しい事項を追加"
            required
          />
        </div>

        <div className="form-group">
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="説明（100文字まで）"
            maxLength={100}
            className="todo-description"
          />
        </div>

        <div className="form-group row">
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
        </div>
      </form>

      <div className="todo-header">
        <h2>📝 トゥドゥ一覧</h2>
        <span className="todo-count">
          {filteredTodos.length} 件
        </span>
      </div>

      <ul className="todo-list">
        {filteredTodos
          .slice()
          .sort((a, b) => b.priority - a.priority)
          .map((todo) => (
            <TodoCard
              key={todo._id}
              todo={todo}
              currentUserId={currentUserId}
              onToggle={toggleTodo}
              onEdit={openEditModal}
              onDelete={deleteTodo}
              onShare={openShareModal}
            />
          ))}
      </ul>
      
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>編集</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="タイトルを編集"
            />

            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="説明（100文字まで）"
              maxLength={100}
              className="todo-description"
            />

            <select
              value={editPriority}
              onChange={(e) => setEditPriority(Number(e.target.value))}
            >
              <option value={1}>🟢 低</option>
              <option value={2}>🟡 中</option>
              <option value={3}>🔴 高</option>
            </select>

            <button className="modal-action primary" onClick={handleEditSubmit}>保存</button>
          </div>
        </div>
      )}

      {shareModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>共有ユーザーを管理</h3>
              <button className="modal-close" onClick={() => setShareModalOpen(false)}>×</button>
            </div>

            <div className="shared-list refined-list">
              {editSharedUser.map((user) => (
                <div key={user._id} className="shared-user-row">
                  <div className="user-info">
                    <strong>{user.username}</strong>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <button onClick={() => handleRemoveSharedUser(user._id)} className="remove-btn">削除</button>
                </div>
              ))}
            </div>

            <div className="share-form">
              <select
                value={selectedUserToShare}
                onChange={(e) => setSelectedUserToShare(e.target.value)}
              >
                <option value="">共有先を選択</option>
                {allUsers
                  .filter((user) => !editSharedUser.find((u) => u._id === user._id))
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
              </select>
              <button className="modal-action secondary" onClick={handleAddSharedUser}>追加</button>
            </div>

            <button className="modal-action primary full-width" onClick={handleSaveSharedUsers}>保存</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default TodoList;

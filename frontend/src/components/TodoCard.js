import React, { useState, useEffect } from 'react';
import {
  FaRegUserCircle,
  FaCheck,
  FaEdit,
  FaTrash,
  FaCreativeCommonsShare,
  FaComment,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const TodoCard = ({ todo, currentUserId, onToggle, onEdit, onDelete, onShare }) => {
  const isOwner = todo.userId?._id === currentUserId;
  const isShared = todo.userId?._id !== currentUserId;
  const token = localStorage.getItem('token');

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const commentsPerPage = 5;

  // Fetch comments when modal opens
  useEffect(() => {
    if (showCommentModal) fetchComments();
  }, [showCommentModal, page]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:5050/api/todos/${todo._id}/comments?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error('コメント取得失敗', err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`http://localhost:5050/api/todos/${todo._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        setCommentText('');
        toast.success('コメントを送信しました。');
        fetchComments();
      } else {
        toast.error('コメントの送信に失敗しました。');
        console.error('送信失敗');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      const res = await fetch(`http://localhost:5050/api/todos/${todo._id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        toast.success('コメントを削除しました。');
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      } else {
        console.error('削除失敗');
        toast.error('コメントの削除に失敗しました。');
      }
    } catch (err) {
      console.error('削除エラー', err);
    }
  };

  const totalPages = Math.ceil((todo.comments?.length || 0) / commentsPerPage);

  return (
    <>
      <div className="todo-main">
        <div className="todo-content">
          <span
            onClick={() => onToggle(todo)}
            className={`todo-title ${todo.completed ? 'completed' : ''}`}
          >
            {isShared && (
              <span className="shared-badge" title="共有タスク">
                <FaCreativeCommonsShare />
              </span>
            )}
            {todo.title}
            {todo.priority === 1 && ' 🟢'}
            {todo.priority === 2 && ' 🟡'}
            {todo.priority === 3 && ' 🔴'}
          </span>

          {todo.description && (
            <div className="todo-meta">
              <small>{todo.description}</small>
            </div>
          )}
        </div>

        <div className="todo-actions">
          {isOwner && (
            <>
              <button onClick={() => onShare(todo)} title="共有">
                <FaRegUserCircle />
              </button>
              <button onClick={() => onEdit(todo)} title="編集">
                <FaEdit />
              </button>
              <button onClick={() => onDelete(todo._id)} title="削除">
                <FaTrash />
              </button>
            </>
          )}
          <div className="comment-action-container">
            <button onClick={() => setShowCommentModal(true)} title="コメント">
              <FaComment />
            </button>
            <span className="comment-count">{todo.comments?.length || 0}</span>
          </div>
        </div>
      </div>

      {showCommentModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>💬 コメント</h3>
              <button className="modal-close" onClick={() => setShowCommentModal(false)}>×</button>
            </div>

            <div className="comment-list">
              {comments.length === 0 && <p>コメントがまだありません。</p>}
              {comments.map((c) => (
                <div key={c._id} className="comment-item">
                  {c.userId?._id === currentUserId && (
                    <button onClick={() => handleCommentDelete(c._id)} className="delete-comment">
                      ✕
                    </button>
                  )}
                  <strong>{c.userId?.username || '匿名'}:</strong>
                  <p>{c.text}</p>
                  <div className="comment-timestamp">
                    <span>
                      {new Date(c.createdAt).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      }).replace(/\//g, '-').replace(' ', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={page === i + 1 ? 'active' : ''}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}

            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="コメントを入力..."
              rows={3}
              style={{ width: '100%', marginTop: '1rem' }}
            />

            <button onClick={handleCommentSubmit} className="modal-action primary full-width" style={{ marginTop: '0.5rem' }}>
              コメント送信
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TodoCard;

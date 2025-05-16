import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function CommentSection({ todoId, token }) {
  const [todo, setTodo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const COMMENTS_PER_PAGE = 3;

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/api/todos/${todoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodo(res.data);
      } catch (err) {
        toast.error('ToDoの取得に失敗しました。');
      }
    };

    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/api/comments?todoId=${todoId}&page=${page}&limit=${COMMENTS_PER_PAGE}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(res.data.comments);
        setHasMore(res.data.hasMore);
      } catch (err) {
        toast.error('コメントの取得に失敗しました。');
      }
    };

    if (token && todoId) {
      fetchTodo();
      fetchComments();
    }
  }, [todoId, token, page]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(`http://localhost:5050/api/comments`, {
        todoId,
        content: newComment,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewComment('');
      setPage(1); // Refresh to newest comments
    } catch (err) {
      toast.error('コメントの投稿に失敗しました。');
    }
  };

  return (
    <div className="comment-section">
      {todo && (
        <div className="todo-preview">
          <h3>{todo.title}</h3>
          <p>{todo.description}</p>
        </div>
      )}

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment._id} className="comment-item">
            <strong>{comment.userId?.username}</strong>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>

      <div className="pagination-controls">
        <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>前へ</button>
        <span>{page}</span>
        <button onClick={() => setPage((prev) => prev + 1)} disabled={!hasMore}>次へ</button>
      </div>

      <div className="comment-input">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="コメントを入力..."
          rows={3}
        />
        <button onClick={handleCommentSubmit}>投稿</button>
      </div>
    </div>
  );
}

export default CommentSection;

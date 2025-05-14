import React from 'react';
import { FaRegUserCircle, FaCheck, FaEdit, FaTrash, FaCreativeCommonsShare } from 'react-icons/fa';
// import './TodoListStyled.css'; // new CSS file for styling

const TodoCard = ({ todo, currentUserId, onToggle, onEdit, onDelete, onShare }) => {
  const isOwner = todo.userId && todo.userId._id?.toString() === currentUserId;
  const isShared = todo.userId && todo.userId._id?.toString() !== currentUserId;

  return (
    <li className="todo-card">
      <div className="todo-main">
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

        {isOwner && (
          <div className="todo-actions">
            <button onClick={() => onShare(todo)} title="共有ユーザー">
              <FaRegUserCircle />
            </button>
            <button onClick={() => onEdit(todo)} title="編集">
              <FaEdit />
            </button>
            <button onClick={() => onDelete(todo._id)} title="削除">
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      {todo.description && (
        <div className="todo-meta">
          <small>{todo.description}</small>
        </div>
      )}
    </li>
  );
};

export default TodoCard;

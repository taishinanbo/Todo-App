const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const CommentSchema = new mongoose.Schema({
  todoId: {
    type: ObjectId,
    ref: 'Todo',
    required: true
  },
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  parentComment: {
    type: ObjectId,
    ref: 'Comment',
    default: null // for replies
  },
  reactions: [{
    emoji: String,
    users: [{ type: ObjectId, ref: 'User' }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', CommentSchema);

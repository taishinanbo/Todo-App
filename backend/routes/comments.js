const router = require('express').Router();
const Comment = require('../models/Comment');
const verifyToken = require('../middleware/verifyToken');

// ✅ CREATE: コメントを追加
router.post('/', verifyToken, async (req, res) => {
  try {
    const { todoId, content, parentComment } = req.body;
    if (!todoId || !content) {
      return res.status(400).json({ message: 'ToDo IDと内容は必須です。' });
    }

    const comment = new Comment({
      todoId,
      content,
      parentComment: parentComment || null,
      userId: req.user.id
    });

    const saved = await comment.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ✅ READ: todoに関連するコメントを取得
router.get('/:todoId', verifyToken, async (req, res) => {
  try {
    const comments = await Comment.find({ todoId: req.params.todoId })
      .populate('userId', 'username email')
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ✅ UPDATE: edit a comment
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: '内容が必要です。' });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'コメントが見つかりません。' });

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'このコメントを編集する権限がありません。' });
    }

    comment.content = content;
    const updated = await comment.save();
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ✅ DELETE: コメントを削除
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'コメントが見つかりません。' });

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'このコメントを削除する権限がありません。' });
    }

    await comment.deleteOne(); // or .remove()
    res.status(200).json({ message: 'コメントを削除しました。' });
  } catch (err) {
    res.status(500).json(err);
  }
});

// ✅ REACT: 絵文字を追加または削除
router.patch('/:id/reaction', verifyToken, async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ message: '絵文字が必要です。' });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'コメントが見つかりません。' });

    const existingReaction = comment.reactions.find(r => r.emoji === emoji);
    const userIdStr = req.user.id.toString();

    if (existingReaction) {
      const index = existingReaction.users.findIndex(u => u.toString() === userIdStr);
      if (index > -1) {
        existingReaction.users.splice(index, 1); // remove
      } else {
        existingReaction.users.push(req.user.id); // add
      }
    } else {
      comment.reactions.push({ emoji, users: [req.user.id] });
    }

    const updated = await comment.save();
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

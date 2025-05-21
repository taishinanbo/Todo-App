const router = require('express').Router();
const Todo = require('../models/Todo');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// CREATE
router.post('/', verifyToken, async (req, res) => {
  try {
    const newTodo = new Todo({
      userId: req.user.id,
      title: req.body.title,
      description: req.body.description || '',
      priority: req.body.priority || 1,
      sharedWith: req.body.sharedWith || [],
    });

    // フィルド確認
    if (!newTodo.title) {
      return res.status(400).json({ message: 'タイトルは必須です。' });
    }
    if (newTodo.priority < 1 || newTodo.priority > 3) {
      return res.status(400).json({ message: '優先度は1から3の間で指定してください。' });
    }

    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(500).json(err);
  }
});

// コメントを投稿
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'ToDoが見つかりません。' });
    }
    const comment = {
      userId: req.user.id,
      text: req.body.text,
      createdAt: new Date()
    };
    todo.comments.push(comment);
    await todo.save();
    const populatedTodo = await Todo.findById(req.params.id)
      .populate('userId', 'username email')
      .populate('sharedWith', 'username email')
      .populate('comments.userId', 'username email');
    res.status(200).json(populatedTodo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// トゥドゥのコメントを取得
router.get('/:id/comments', verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;

  try {
    const todo = await Todo.findById(req.params.id)
      .populate('comments.userId', 'username email');

    if (!todo) {
      return res.status(404).json({ message: 'ToDoが見つかりません。' });
    }

    const total = todo.comments.length;
    const start = (page - 1) * limit;
    const paginated = todo.comments.slice(start, start + limit);

    res.status(200).json({
      comments: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// コメントを削除
router.delete('/:id/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'ToDoが見つかりません。' });
    }
    const commentIndex = todo.comments.findIndex(comment => comment._id.toString() === req.params.commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'コメントが見つかりません。' }); 
    }
    if (todo.comments[commentIndex].userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'コメントの削除権限がありません。' });
    }
    todo.comments.splice(commentIndex, 1);
    await todo.save();
    const populatedTodo = await Todo.findById(req.params.id)
      .populate('userId', 'username email')
      .populate('sharedWith', 'username email')
      .populate('comments.userId', 'username email');
    res.status(200).json(populatedTodo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// Get the current user ID
router.get('/currentUser', verifyToken, (req, res) => {
  res.status(200).json({ userId: req.user.id });
});

router.get('/users', verifyToken, async (req, res) => {
  // get all the users and populate with username
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }, 'username email');
    res.status(200).json(users);
    console.log(users);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

// GET ALL
// even shared todos
router.get('/', verifyToken, async (req, res) => {
  try {
    const todos = await Todo.find({
      $or: [
        { userId: req.user.id },
        { sharedWith: req.user.id }
      ]
    }).populate('userId', 'username email').populate('sharedWith', 'username email');
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'ToDoが見つかりません。' });
    }

    const isOwner = todo.userId.toString() === req.user.id;
    const isSharedUser = todo.sharedWith.map(id => id.toString()).includes(req.user.id);

    if (!isOwner && !isSharedUser) {
      return res.status(403).json({ message: 'アクセスが拒否されました。' });
    }

    // 共有ユーザーの場合は、完了状態のみ変更可能
    if (!isOwner) {
      if (!Object.keys(req.body).every(key => key === 'completed')) {
        return res.status(403).json({ message: '共有ユーザーは完了状態のみ変更できます。' });
      }

      todo.completed = req.body.completed;
      const updated = await todo.save();
      return res.status(200).json(updated);
    }

    // 所有者の場合は全てのフィールドを更新可能
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    return res.status(200).json(updatedTodo);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});


// PATCH /todos/:id/share
router.patch('/:id/share', verifyToken, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.id });
    if (!todo) return res.status(404).json('Todo not found');

    const { sharedWith } = req.body;
    if (!Array.isArray(sharedWith)) return res.status(400).json('Invalid format');

    todo.sharedWith = sharedWith;
    await todo.save();

    const populated = await Todo.findById(todo._id)
      .populate('userId', 'username email')
      .populate('sharedWith', 'username email');

    res.status(200).json(populated);
  } catch (err) {
    res.status(500).json(err);
  }
});


// DELETE
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.status(200).json("Todo deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});



module.exports = router;
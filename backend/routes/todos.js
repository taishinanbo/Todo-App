const router = require('express').Router();
const Todo = require('../models/Todo');
const verifyToken = require('../middleware/verifyToken');


// CREATE
router.post('/', verifyToken, async (req, res) => {
  try {
    const newTodo = new Todo({
      userId: req.user.id,
      title: req.body.title
    });
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.id });
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updated = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updated);
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
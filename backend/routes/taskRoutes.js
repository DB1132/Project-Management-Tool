const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTaskStatus
} = require('../controllers/taskController');
const { protect } = require('../middleware/authmiddleware');

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.route('/:id/status')
  .put(protect, updateTaskStatus);

module.exports = router;

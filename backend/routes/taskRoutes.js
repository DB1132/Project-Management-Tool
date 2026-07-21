const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTaskStatus,
  uploadTaskAttachment
} = require('../controllers/taskController');
const { protect } = require('../middleware/authmiddleware');
const upload = require('../utils/multerConfig');

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.route('/:id/status')
  .put(protect, updateTaskStatus);

router.route('/:id/attachments')
  .post(protect, upload.single('file'), uploadTaskAttachment);

module.exports = router;

const express = require('express');
const router = express.Router();
const { searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authmiddleware');

router.get('/', protect, searchUsers);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  addProjectMember,
  getProjectMembers,
  getProjectComments
} = require('../controllers/projectController');
const { protect } = require('../middleware/authmiddleware');

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById);

router.route('/:id/members')
  .post(protect, addProjectMember)
  .get(protect, getProjectMembers);

router.route('/:id/comments')
  .get(protect, getProjectComments);

module.exports = router;

const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Comment = require('../models/Comment');
const User = require('../models/User');

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id
    });

    // Add creator as admin member
    await ProjectMember.create({
      projectId: project._id,
      userId: req.user._id,
      role: 'admin'
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    // Find projects where user is a member
    const memberships = await ProjectMember.find({ userId: req.user._id });
    const projectIds = memberships.map(m => m.projectId);
    
    const projects = await Project.find({ _id: { $in: projectIds } });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Check if user is a member
    const membership = await ProjectMember.findOne({ projectId: project._id, userId: req.user._id });
    if (!membership) return res.status(403).json({ error: 'Not authorized' });

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addProjectMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Ensure requesting user is admin
    const requester = await ProjectMember.findOne({ projectId: project._id, userId: req.user._id });
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ error: 'User to add not found' });

    const member = await ProjectMember.create({
      projectId: project._id,
      userId: userToAdd._id,
      role: role || 'member'
    });

    res.status(201).json(member);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'User is already a member of this project' });
    }
    res.status(500).json({ error: error.message });
  }
};

const getProjectMembers = async (req, res) => {
  try {
    const members = await ProjectMember.find({ projectId: req.params.id }).populate('userId', 'name email');
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProjectComments = async (req, res) => {
  try {
    const comments = await Comment.find({ projectId: req.params.id }).populate('userId', 'name email').sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  addProjectMember,
  getProjectMembers,
  getProjectComments
};

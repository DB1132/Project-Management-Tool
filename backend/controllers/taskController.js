const Task = require('../models/Task');
const ProjectMember = require('../models/ProjectMember');

const createTask = async (req, res) => {
  try {
    const { projectId, title, description, status, priority, assignedTo, dueDate } = req.body;
    
    // Check if requester is admin of the project
    const membership = await ProjectMember.findOne({ projectId, userId: req.user._id });
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create tasks in this project' });
    }

    const task = await Task.create({
      projectId,
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      createdBy: req.user._id
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query; // pass projectId as query param
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    // Check membership
    const membership = await ProjectMember.findOne({ projectId, userId: req.user._id });
    if (!membership) return res.status(403).json({ error: 'Not authorized to view tasks for this project' });

    const tasks = await Task.find({ projectId }).populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Verify user is member of project
    const membership = await ProjectMember.findOne({ projectId: task.projectId, userId: req.user._id });
    if (!membership) return res.status(403).json({ error: 'Not authorized' });

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus
};

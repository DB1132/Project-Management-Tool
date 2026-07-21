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

    const tasks = await Task.find({ projectId })
      .populate('assignedTo', 'name email')
      .populate('attachments.uploadedBy', 'name email');
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

    const membership = await ProjectMember.findOne({ projectId: task.projectId, userId: req.user._id });
    if (!membership) return res.status(403).json({ error: 'Not authorized to access this project' });

    const isAdmin = membership.role === 'admin';
    const isAssignedToUser = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignedToUser) {
      return res.status(403).json({ error: 'You can only update tasks assigned to you' });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadTaskAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const membership = await ProjectMember.findOne({ projectId: task.projectId, userId: req.user._id });
    if (!membership) return res.status(403).json({ error: 'Not authorized to access this project' });

    const attachment = {
      filename: req.file.originalname,
      path: `uploads/${req.file.filename}`, 
      uploadedBy: req.user._id
    };

    task.attachments.push(attachment);
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('attachments.uploadedBy', 'name email');

    res.status(201).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
  uploadTaskAttachment
};

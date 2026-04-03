const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// ── Helper: check if user is a member or owner of the project ────────────────
const isProjectMember = (project, userId) => {
  const id = userId.toString();
  return (
    project.owner.toString() === id ||
    project.members.some((m) => m.toString() === id)
  );
};

// ── GET /api/tasks/:projectId ────────────────────────────────────────────────
const getTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (!isProjectMember(project, req.user._id)) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view tasks for this project.' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error('Get tasks error:', err.message);
    res.status(500).json({ message: 'Server error fetching tasks.' });
  }
};

// ── POST /api/tasks ──────────────────────────────────────────────────────────
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, projectId, assignedTo, dueDate, priority } = req.body;

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (!isProjectMember(project, req.user._id)) {
      return res
        .status(403)
        .json({ message: 'Not authorized to add tasks to this project.' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      dueDate: dueDate || null,
      priority: priority || 'Medium',
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (err) {
    console.error('Create task error:', err.message);
    res.status(500).json({ message: 'Server error creating task.' });
  }
};

// ── PUT /api/tasks/:id ───────────────────────────────────────────────────────
const updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Verify the user belongs to the project that owns this task
    const project = await Project.findById(task.project);
    if (!isProjectMember(project, req.user._id)) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this task.' });
    }

    const { title, description, status, assignedTo, dueDate, priority } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json(task);
  } catch (err) {
    console.error('Update task error:', err.message);
    res.status(500).json({ message: 'Server error updating task.' });
  }
};

// ── DELETE /api/tasks/:id ────────────────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const project = await Project.findById(task.project);
    if (!isProjectMember(project, req.user._id)) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this task.' });
    }

    await task.deleteOne();

    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('Delete task error:', err.message);
    res.status(500).json({ message: 'Server error deleting task.' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };

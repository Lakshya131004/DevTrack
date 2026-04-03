const { validationResult } = require('express-validator');
const Project = require('../models/Project');

// ── GET /api/projects ────────────────────────────────────────────────────────
// Returns all projects where the logged-in user is the owner OR a member
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error('Get projects error:', err.message);
    res.status(500).json({ message: 'Server error fetching projects.' });
  }
};

// ── POST /api/projects ───────────────────────────────────────────────────────
const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, members } = req.body;

  try {
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      // Allow caller to pre-populate members; always include owner
      members: members ? [...new Set([req.user._id.toString(), ...members])] : [req.user._id],
    });

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(201).json(project);
  } catch (err) {
    console.error('Create project error:', err.message);
    res.status(500).json({ message: 'Server error creating project.' });
  }
};

// ── PUT /api/projects/:id ────────────────────────────────────────────────────
const updateProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Only the project owner may update it
    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized. Only the owner can update this project.' });
    }

    const { name, description, members, status } = req.body;

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (members !== undefined) project.members = members;
    if (status !== undefined) project.status = status;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.json(project);
  } catch (err) {
    console.error('Update project error:', err.message);
    res.status(500).json({ message: 'Server error updating project.' });
  }
};

// ── DELETE /api/projects/:id ─────────────────────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Only the project owner may delete it
    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized. Only the owner can delete this project.' });
    }

    await project.deleteOne();

    // Optionally cascade-delete tasks — uncomment if desired:
    // await Task.deleteMany({ project: req.params.id });

    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    console.error('Delete project error:', err.message);
    res.status(500).json({ message: 'Server error deleting project.' });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };

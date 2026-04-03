const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All project routes require authentication
router.use(protect);

// ── GET /api/projects ────────────────────────────────────────────────────────
router.get('/', getProjects);

// ── POST /api/projects ───────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Project name is required.')
      .isLength({ max: 150 }).withMessage('Project name cannot exceed 150 characters.'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
    body('members')
      .optional()
      .isArray().withMessage('Members must be an array of user IDs.'),
  ],
  createProject
);

// ── PUT /api/projects/:id ────────────────────────────────────────────────────
router.put(
  '/:id',
  [
    body('name')
      .optional()
      .trim()
      .notEmpty().withMessage('Project name cannot be empty.')
      .isLength({ max: 150 }).withMessage('Project name cannot exceed 150 characters.'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
    body('status')
      .optional()
      .isIn(['Active', 'Archived']).withMessage('Status must be Active or Archived.'),
    body('members')
      .optional()
      .isArray().withMessage('Members must be an array of user IDs.'),
  ],
  updateProject
);

// ── DELETE /api/projects/:id ─────────────────────────────────────────────────
router.delete('/:id', deleteProject);

module.exports = router;

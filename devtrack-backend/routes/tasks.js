const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(protect);

// ── GET /api/tasks/:projectId ────────────────────────────────────────────────
router.get('/:projectId', getTasks);

// ── POST /api/tasks ──────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty().withMessage('Task title is required.')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters.'),
    body('projectId')
      .notEmpty().withMessage('Project ID is required.')
      .isMongoId().withMessage('Project ID must be a valid MongoDB ObjectId.'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters.'),
    body('assignedTo')
      .optional({ nullable: true })
      .isMongoId().withMessage('assignedTo must be a valid user ID.'),
    body('status')
      .optional()
      .isIn(['To Do', 'In Progress', 'Completed'])
      .withMessage('Status must be one of: To Do, In Progress, Completed.'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High.'),
    body('dueDate')
      .optional({ nullable: true })
      .isISO8601().withMessage('Due date must be a valid ISO 8601 date.'),
  ],
  createTask
);

// ── PUT /api/tasks/:id ───────────────────────────────────────────────────────
router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .notEmpty().withMessage('Title cannot be empty.')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters.'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters.'),
    body('status')
      .optional()
      .isIn(['To Do', 'In Progress', 'Completed'])
      .withMessage('Status must be one of: To Do, In Progress, Completed.'),
    body('assignedTo')
      .optional({ nullable: true })
      .isMongoId().withMessage('assignedTo must be a valid user ID.'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High.'),
    body('dueDate')
      .optional({ nullable: true })
      .isISO8601().withMessage('Due date must be a valid ISO 8601 date.'),
  ],
  updateTask
);

// ── DELETE /api/tasks/:id ────────────────────────────────────────────────────
router.delete('/:id', deleteTask);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const { register, login, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/register ───────────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required.')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  register
);

// ── POST /api/login ──────────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  login
);

// ── POST /api/logout ─────────────────────────────────────────────────────────
// Protected so only authenticated users can hit this endpoint
router.post('/logout', protect, logout);

module.exports = router;

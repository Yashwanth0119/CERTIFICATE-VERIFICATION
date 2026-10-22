import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Unified login endpoint for all users:
 * - Employee 1: employee1 / Emp@12345
 * - Employee 2: employee2 / Emp@12345
 * - HR Administrator: hradmin / HR@12345
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Both username and password are required.'
    });
  }

  const user = db.getUserByUsername(username);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password.'
    });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password.'
    });
  }

  // Issue signed JWT token (valid for 8 hours)
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  db.logAction(user.id, 'USER_LOGIN', `User ${user.username} (${user.role}) logged in successfully.`);

  return res.json({
    success: true,
    message: 'Authentication successful.',
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
      email: user.email
    }
  });
});

/**
 * GET /api/auth/me
 * Retrieves authenticated user profile
 */
router.get('/me', authenticateToken, (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});

/**
 * POST /api/auth/logout
 * Logs logout action and clears session
 */
router.post('/logout', authenticateToken, (req, res) => {
  db.logAction(req.user.id, 'USER_LOGOUT', `User ${req.user.username} logged out.`);
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export default router;

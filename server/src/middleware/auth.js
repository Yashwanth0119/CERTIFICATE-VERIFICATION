import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'cert-verification-portal-jwt-secret-key-2025';

/**
 * Middleware to authenticate requests via Bearer JWT token
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No session token provided.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired session token. Please log in again.'
      });
    }

    const user = db.getUserById(decoded.id);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User account not found.'
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
      email: user.email
    };

    next();
  });
}

/**
 * Middleware to restrict access to a specific role (e.g., 'employee' or 'hr')
 */
export function requireRole(allowedRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires ${allowedRole.toUpperCase()} privileges.`
      });
    }

    next();
  };
}

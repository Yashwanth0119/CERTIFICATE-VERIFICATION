import express from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/registry
 * Returns institutional registry records
 */
router.get('/', authenticateToken, (req, res) => {
  const records = db.getAllRegistryRecords();
  return res.json({
    success: true,
    total: records.length,
    registry: records
  });
});

export default router;

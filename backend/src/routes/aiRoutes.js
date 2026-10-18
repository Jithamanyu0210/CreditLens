import express from 'express';
import {
  explainAffordability,
  explainComparison,
  getAiStatus
} from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import {
  validateAiAffordability,
  validateAiComparison
} from '../middleware/validateRequest.js';

const router = express.Router();

// GET /api/ai/status - Returns Gemini availability & model metadata
router.get('/status', getAiStatus);

// POST /api/ai/explain-affordability - AI explanation of loan affordability calculation
router.post('/explain-affordability', optionalAuth, validateAiAffordability, explainAffordability);

// POST /api/ai/explain-comparison - AI comparative insight across multiple loan options
router.post('/explain-comparison', optionalAuth, validateAiComparison, explainComparison);

export default router;

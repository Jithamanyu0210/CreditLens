import express from 'express';
import {
  explainAffordability,
  explainComparison,
  getAiStatus,
  getFinancialInsights,
  getBudgetInsights,
  chatWithAssistant
} from '../controllers/aiController.js';
import { optionalAuth, protect } from '../middleware/authMiddleware.js';
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

// Dedicated AI Financial Assistant Routes (Protected)
router.post('/financial-insights', protect, getFinancialInsights);
router.post('/budget-insights', protect, getBudgetInsights);
router.post('/chat', protect, chatWithAssistant);

export default router;

import express from 'express';
import { calculateLoan, generateSchedule, compareLoans } from '../controllers/loanController.js';
import { validateLoanInputs } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post('/calculate', validateLoanInputs, calculateLoan);
router.post('/schedule', validateLoanInputs, generateSchedule);
router.post('/compare', compareLoans);

export default router;

import express from 'express';
import {
  calculateLoanEMI,
  assessAffordability,
  generateAmortization,
  compareLoans
} from '../controllers/loanController.js';
import { validateLoanInputs } from '../middleware/validateRequest.js';

const router = express.Router();

router.post('/calculate-emi', validateLoanInputs, calculateLoanEMI);
router.post('/affordability', validateLoanInputs, assessAffordability);
router.post('/amortization', validateLoanInputs, generateAmortization);
router.post('/compare', compareLoans);

export default router;

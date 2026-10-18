import express from 'express';
import {
  getMaxLoanCapacity,
  getPrepaymentAnalysis,
  getEmergencyFundAnalysis,
  compareScenariosAnalysis
} from '../controllers/simulatorController.js';

const router = express.Router();

router.post('/max-loan', getMaxLoanCapacity);
router.post('/prepayment', getPrepaymentAnalysis);
router.post('/emergency-fund', getEmergencyFundAnalysis);
router.post('/compare-scenarios', compareScenariosAnalysis);

export default router;

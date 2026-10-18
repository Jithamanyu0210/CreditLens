import express from 'express';
import {
  getBankRates,
  getCategories,
  getBankList,
  searchBankRate,
  getBankRateById,
  seedBankRates,
  updateBankRate,
  createBankRate
} from '../controllers/bankRateController.js';

const router = express.Router();

// 1. Get all bank rates (with query filters: loanType, bank, bankType, search, sortBy, sortOrder)
router.get('/', getBankRates);

// 2. Get list of loan categories with verified rate counts
router.get('/categories', getCategories);

// 3. Get distinct list of banks with supported categories
router.get('/banks', getBankList);

// 4. Search exact bank rate by bank name + loan type (e.g. ?bank=SBI&loanType=car)
router.get('/search', searchBankRate);

// 5. Maintenance / admin seed endpoint to refresh canonical verified rates
router.post('/seed', seedBankRates);

// 6. Create a new verified rate (admin / controlled manual entry)
router.post('/', createBankRate);

// 7. Get specific bank rate by ID
router.get('/:id', getBankRateById);

// 6. Update verified bank rate (admin / controlled manual process)
router.put('/:id', updateBankRate);

export default router;

import express from 'express';
import {
  getSavedScenarios,
  getSavedScenarioById,
  createSavedScenario,
  updateSavedScenario,
  duplicateSavedScenario,
  deleteSavedScenario
} from '../controllers/scenarioController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateScenarioInputs } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(protect); // All scenario endpoints require authentication

router.get('/', getSavedScenarios);
router.post('/', validateScenarioInputs, createSavedScenario);
router.get('/:id', getSavedScenarioById);
router.put('/:id', validateScenarioInputs, updateSavedScenario);
router.post('/:id/duplicate', duplicateSavedScenario);
router.delete('/:id', deleteSavedScenario);

export default router;

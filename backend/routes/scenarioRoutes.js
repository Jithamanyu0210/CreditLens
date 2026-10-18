import express from 'express';
import { getSavedScenarios, createSavedScenario, updateSavedScenario, deleteSavedScenario } from '../controllers/scenarioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSavedScenarios)
  .post(createSavedScenario);

router.route('/:id')
  .put(updateSavedScenario)
  .delete(deleteSavedScenario);

export default router;

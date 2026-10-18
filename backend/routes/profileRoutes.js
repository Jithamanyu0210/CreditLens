import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateProfileInputs } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProfile)
  .put(protect, validateProfileInputs, updateProfile);

export default router;

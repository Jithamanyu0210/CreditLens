import express from 'express';
import { getProfile, saveOrUpdateProfile, deleteProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateProfileInputs } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(protect); // All profile routes are protected

router.get('/', getProfile);
router.post('/', validateProfileInputs, saveOrUpdateProfile);
router.put('/', validateProfileInputs, saveOrUpdateProfile);
router.delete('/', deleteProfile);

export default router;

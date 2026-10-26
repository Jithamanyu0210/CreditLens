import express from 'express';
import { registerUser, loginUser, getMe, logoutUser, updateUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validateRequest.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/logout', logoutUser);

export default router;

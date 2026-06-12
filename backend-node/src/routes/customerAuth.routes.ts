import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { register, login, refreshAccessToken, getProfile, updateProfile } from '../controllers/customerAuth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshAccessToken);
router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, updateProfile);

export default router;

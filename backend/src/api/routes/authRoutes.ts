import { Router } from 'express';
import { googleAuth, googleCallback, getMe } from '../controllers/authController';
import { isAuth } from '../middleware/authMiddleware';

const router = Router();

// GET /api/v1/auth/google — start Google OAuth
router.get('/google', googleAuth);

// GET /api/v1/auth/google/callback — Google OAuth callback
router.get('/google/callback', ...googleCallback);

// GET /api/v1/auth/me — get current user (protected)
router.get('/me', isAuth, getMe);

export default router;

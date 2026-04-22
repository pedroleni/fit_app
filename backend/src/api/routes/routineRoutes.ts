import { Router } from 'express';
import { generateRoutine } from '../controllers/routineController';
import { isAuth } from '../middleware/authMiddleware';

const router = Router();

// POST /api/v1/routines/generate — generate a weekly routine via Gemini (protected)
router.post('/generate', isAuth, generateRoutine);

export default router;

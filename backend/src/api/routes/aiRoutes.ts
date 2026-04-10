import { Router } from 'express';
import { askAI } from '../controllers/aiController';
import { isAuth } from '../middleware/authMiddleware';

const router = Router();

// POST /api/v1/ai/ask — send a message to an AI coach (protected)
router.post('/ask', isAuth, askAI);

export default router;

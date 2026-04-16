import { Router } from 'express';
import { searchExercises } from '../controllers/exerciseController';
import { isAuth } from '../middleware/authMiddleware';

const router = Router();

// POST /api/v1/exercises/search — fetch exercises by muscle group via Gemini (protected)
router.post('/search', isAuth, searchExercises);

export default router;

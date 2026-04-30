import { Router } from 'express';
import { getExerciseImage } from '../controllers/exerciseImageController';
import { isAuth } from '../middleware/authMiddleware';

const router = Router();

// POST /api/v1/exercises/image
// Body: { nombre: string, grupoMuscular: string }
// Returns: { imageBase64: string, mimeType: string }
router.post('/image', isAuth, getExerciseImage);

export default router;

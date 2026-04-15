import { Router } from 'express';
import { createWorkout, getWorkouts, deleteWorkout } from '../controllers/workoutController';
import { isAuth } from '../middleware/authMiddleware';

const router = Router();

// All workout routes require authentication
router.use(isAuth);

// GET  /api/v1/workouts?limit=20&skip=0
router.get('/', getWorkouts);

// POST /api/v1/workouts
router.post('/', createWorkout);

// DELETE /api/v1/workouts/:id
router.delete('/:id', deleteWorkout);

export default router;

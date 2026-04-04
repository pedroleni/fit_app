import { Router } from 'express';
import { logWater, getWaterToday, getWaterHistory } from '../controllers/waterController';
import { isAuth } from '../middleware/authMiddleware';

const router = Router();

// All water routes require authentication
router.use(isAuth);

// GET  /api/v1/water?date=2026-02-22
router.get('/', getWaterToday);

// GET  /api/v1/water/history?limit=30
router.get('/history', getWaterHistory);

// POST /api/v1/water
router.post('/', logWater);

export default router;

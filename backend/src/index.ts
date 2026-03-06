import express from 'express';
import cors from 'cors';
import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './infrastructure/db/mongoose';
import { configurePassport } from './infrastructure/auth/googleStrategy';
import authRoutes from './api/routes/authRoutes';
import workoutRoutes from './api/routes/workoutRoutes';
import waterRoutes from './api/routes/waterRoutes';
import aiRoutes from './api/routes/aiRoutes';
import exerciseRoutes from './api/routes/exerciseRoutes';
import routineRoutes from './api/routes/routineRoutes';
import exerciseImageRoutes from './api/routes/exerciseImageRoutes';

const app = express();
const PORT = process.env.PORT ?? 3000;

// — Connect to MongoDB
connectDB();

// — Configure Passport
configurePassport();

// — Global Middleware
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL ?? 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));
app.use(passport.initialize());

// — Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/water', waterRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/routines', routineRoutes);
app.use('/api/v1/exercises', exerciseImageRoutes);

// — 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// — Global error handler
app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status ?? 500).json({ message: err.message ?? 'Internal server error' });
});

app.disable('x-powered-by');

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

export default app;

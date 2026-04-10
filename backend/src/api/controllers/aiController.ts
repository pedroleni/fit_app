import { Request, Response, NextFunction } from 'express';
import { AskGeminiUseCase, GeminiError } from '../../application/usecases/ai/AskGeminiUseCase';
import { MongoWorkoutRepository } from '../../infrastructure/repositories/MongoWorkoutRepository';
import { MongoWaterRepository } from '../../infrastructure/repositories/MongoWaterRepository';

const askGeminiUseCase = new AskGeminiUseCase();
const workoutRepository = new MongoWorkoutRepository();
const waterRepository = new MongoWaterRepository();

export const askAI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ message: 'Message is required' });
      return;
    }

    const user = req.user!;

    const [recentWorkouts, waterToday] = await Promise.all([
      workoutRepository.findByUserId(user.id, 5, 0),
      waterRepository.getTotalByUserIdAndDate(user.id, new Date()),
    ]);

    const answer = await askGeminiUseCase.execute({
      message,
      userContext: {
        name: user.name,
        recentWorkouts: recentWorkouts.map((w) => `${w.title} (${w.type}, ${w.duration} min)`),
        dailyWaterMl: waterToday,
      },
    });

    res.status(200).json({ answer });
  } catch (error) {
    console.error('❌ AI error:', error);
    if (error instanceof GeminiError) {
      // Devuelve el código HTTP correcto (429, 502...) con mensaje en español
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

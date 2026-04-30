import { Request, Response, NextFunction } from 'express';
import { GenerateRoutineUseCase } from '../../application/usecases/ai/GenerateRoutineUseCase';
import { GeminiError } from '../../application/usecases/ai/AskGeminiUseCase';

const generateRoutineUseCase = new GenerateRoutineUseCase();

export const generateRoutine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { days, duration, weight, height } = req.body;

    if (!days || !Array.isArray(days) || days.length === 0) {
      res.status(400).json({ message: 'days must be a non-empty array' });
      return;
    }
    if (!duration || isNaN(Number(duration))) {
      res.status(400).json({ message: 'duration must be a valid number' });
      return;
    }
    if (!weight || isNaN(Number(weight))) {
      res.status(400).json({ message: 'weight must be a valid number' });
      return;
    }
    if (!height || isNaN(Number(height))) {
      res.status(400).json({ message: 'height must be a valid number' });
      return;
    }

    const routine = await generateRoutineUseCase.execute({
      days,
      duration: Number(duration),
      weight: Number(weight),
      height: Number(height),
    });

    res.status(200).json({ routine });
  } catch (error) {
    console.error('❌ Routine generation error:', error);
    if (error instanceof GeminiError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

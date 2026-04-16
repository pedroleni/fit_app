import { Request, Response, NextFunction } from 'express';
import { FetchExercisesUseCase } from '../../application/usecases/ai/FetchExercisesUseCase';
import { GeminiError } from '../../application/usecases/ai/AskGeminiUseCase';

const fetchExercisesUseCase = new FetchExercisesUseCase();

export const searchExercises = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { muscleGroup, weight, height } = req.body;

    if (!muscleGroup || typeof muscleGroup !== 'string') {
      res.status(400).json({ message: 'muscleGroup is required' });
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

    const exercises = await fetchExercisesUseCase.execute({
      muscleGroup,
      weight: Number(weight),
      height: Number(height),
    });

    res.status(200).json({ exercises });
  } catch (error) {
    console.error('❌ Exercise search error:', error);
    if (error instanceof GeminiError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

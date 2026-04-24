import { Request, Response, NextFunction } from 'express';
import { GenerateExerciseImageUseCase } from '../../application/usecases/ai/GenerateExerciseImageUseCase';

const useCase = new GenerateExerciseImageUseCase();

export async function getExerciseImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { nombre, grupoMuscular } = req.body as {
      nombre: string;
      grupoMuscular: string;
    };

    if (!nombre || typeof nombre !== 'string') {
      res.status(400).json({ message: 'nombre is required' });
      return;
    }

    const result = await useCase.execute(nombre, grupoMuscular ?? '');
    res.json(result);
  } catch (err) {
    next(err);
  }
}

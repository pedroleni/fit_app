import { Request, Response, NextFunction } from 'express';
import { CreateWorkoutUseCase } from '../../application/usecases/workout/CreateWorkoutUseCase';
import { GetWorkoutsUseCase } from '../../application/usecases/workout/GetWorkoutsUseCase';
import { DeleteWorkoutUseCase } from '../../application/usecases/workout/DeleteWorkoutUseCase';
import { MongoWorkoutRepository } from '../../infrastructure/repositories/MongoWorkoutRepository';
import { CreateWorkoutDto } from '../../domain/entities/Workout';

const workoutRepository = new MongoWorkoutRepository();
const createWorkoutUseCase = new CreateWorkoutUseCase(workoutRepository);
const getWorkoutsUseCase = new GetWorkoutsUseCase(workoutRepository);
const deleteWorkoutUseCase = new DeleteWorkoutUseCase(workoutRepository);

export const createWorkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data: CreateWorkoutDto = { ...req.body, userId, date: req.body.date ? new Date(req.body.date) : new Date() };
    const workout = await createWorkoutUseCase.execute(data);
    res.status(201).json({ workout });
  } catch (error) {
    next(error);
  }
};

export const getWorkouts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = parseInt(req.query.skip as string) || 0;
    const result = await getWorkoutsUseCase.execute({ userId, limit, skip });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteWorkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const deleted = await deleteWorkoutUseCase.execute(id, userId);
    res.status(200).json({ deleted });
  } catch (error) {
    next(error);
  }
};

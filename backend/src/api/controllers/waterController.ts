import { Request, Response, NextFunction } from 'express';
import { LogWaterUseCase } from '../../application/usecases/water/LogWaterUseCase';
import { GetWaterUseCase } from '../../application/usecases/water/GetWaterUseCase';
import { MongoWaterRepository } from '../../infrastructure/repositories/MongoWaterRepository';
import { CreateWaterIntakeDto } from '../../domain/entities/WaterIntake';

const waterRepository = new MongoWaterRepository();
const logWaterUseCase = new LogWaterUseCase(waterRepository);
const getWaterUseCase = new GetWaterUseCase(waterRepository);

export const logWater = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data: CreateWaterIntakeDto = {
      userId,
      amount: Number(req.body.amount),
      date: req.body.date ? new Date(req.body.date) : new Date(),
    };
    const entry = await logWaterUseCase.execute(data);
    res.status(201).json({ entry });
  } catch (error) {
    next(error);
  }
};

export const getWaterToday = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const result = await getWaterUseCase.execute(userId, date);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getWaterHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 30;
    const history = await getWaterUseCase.getHistory(userId, limit);
    res.status(200).json({ history });
  } catch (error) {
    next(error);
  }
};

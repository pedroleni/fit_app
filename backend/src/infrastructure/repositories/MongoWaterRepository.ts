import { WaterRepository } from '../../../domain/ports/WaterRepository';
import { WaterIntake, CreateWaterIntakeDto } from '../../../domain/entities/WaterIntake';
import { WaterModel, WaterDocument } from '../models/WaterModel';

function toEntity(doc: WaterDocument): WaterIntake {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    amount: doc.amount,
    date: doc.date,
    createdAt: doc.createdAt as Date,
  };
}

export class MongoWaterRepository implements WaterRepository {
  async findById(id: string): Promise<WaterIntake | null> {
    const doc = await WaterModel.findById(id);
    return doc ? toEntity(doc) : null;
  }

  async findByUserId(userId: string, limit = 30, skip = 0): Promise<WaterIntake[]> {
    const docs = await WaterModel.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    return docs.map(toEntity);
  }

  async findByUserIdAndDate(userId: string, date: Date): Promise<WaterIntake[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const docs = await WaterModel.find({ userId, date: { $gte: start, $lte: end } });
    return docs.map(toEntity);
  }

  async getTotalByUserIdAndDate(userId: string, date: Date): Promise<number> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const result = await WaterModel.aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return result[0]?.total ?? 0;
  }

  async create(data: CreateWaterIntakeDto): Promise<WaterIntake> {
    const doc = await WaterModel.create(data);
    return toEntity(doc);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await WaterModel.findOneAndDelete({ _id: id, userId });
    return result !== null;
  }
}

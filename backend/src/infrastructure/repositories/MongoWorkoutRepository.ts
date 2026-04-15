import { WorkoutRepository } from '../../../domain/ports/WorkoutRepository';
import { Workout, CreateWorkoutDto } from '../../../domain/entities/Workout';
import { WorkoutModel, WorkoutDocument } from '../models/WorkoutModel';

function toEntity(doc: WorkoutDocument): Workout {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    title: doc.title,
    type: doc.type,
    duration: doc.duration,
    calories: doc.calories,
    exercises: doc.exercises,
    notes: doc.notes,
    date: doc.date,
    createdAt: doc.createdAt as Date,
    updatedAt: doc.updatedAt as Date,
  };
}

export class MongoWorkoutRepository implements WorkoutRepository {
  async findById(id: string): Promise<Workout | null> {
    const doc = await WorkoutModel.findById(id);
    return doc ? toEntity(doc) : null;
  }

  async findByUserId(userId: string, limit = 20, skip = 0): Promise<Workout[]> {
    const docs = await WorkoutModel.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    return docs.map(toEntity);
  }

  async findByUserIdAndDate(userId: string, date: Date): Promise<Workout[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const docs = await WorkoutModel.find({ userId, date: { $gte: start, $lte: end } });
    return docs.map(toEntity);
  }

  async create(data: CreateWorkoutDto): Promise<Workout> {
    const doc = await WorkoutModel.create(data);
    return toEntity(doc);
  }

  async update(id: string, userId: string, data: Partial<Workout>): Promise<Workout | null> {
    const doc = await WorkoutModel.findOneAndUpdate(
      { _id: id, userId },
      data,
      { new: true }
    );
    return doc ? toEntity(doc) : null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await WorkoutModel.findOneAndDelete({ _id: id, userId });
    return result !== null;
  }

  async countByUserId(userId: string): Promise<number> {
    return WorkoutModel.countDocuments({ userId });
  }
}

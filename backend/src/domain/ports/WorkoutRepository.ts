import { Workout, CreateWorkoutDto } from '../entities/Workout';

export interface WorkoutRepository {
  findById(id: string): Promise<Workout | null>;
  findByUserId(userId: string, limit?: number, skip?: number): Promise<Workout[]>;
  findByUserIdAndDate(userId: string, date: Date): Promise<Workout[]>;
  create(data: CreateWorkoutDto): Promise<Workout>;
  update(id: string, userId: string, data: Partial<Workout>): Promise<Workout | null>;
  delete(id: string, userId: string): Promise<boolean>;
  countByUserId(userId: string): Promise<number>;
}

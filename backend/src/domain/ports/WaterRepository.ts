import { WaterIntake, CreateWaterIntakeDto } from '../entities/WaterIntake';

export interface WaterRepository {
  findById(id: string): Promise<WaterIntake | null>;
  findByUserId(userId: string, limit?: number, skip?: number): Promise<WaterIntake[]>;
  findByUserIdAndDate(userId: string, date: Date): Promise<WaterIntake[]>;
  getTotalByUserIdAndDate(userId: string, date: Date): Promise<number>;
  create(data: CreateWaterIntakeDto): Promise<WaterIntake>;
  delete(id: string, userId: string): Promise<boolean>;
}

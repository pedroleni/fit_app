import { WaterIntake } from '../../../domain/entities/WaterIntake';
import { WaterRepository } from '../../../domain/ports/WaterRepository';

interface GetWaterResult {
  entries: WaterIntake[];
  totalMl: number;
}

export class GetWaterUseCase {
  constructor(private readonly waterRepository: WaterRepository) {}

  async execute(userId: string, date?: Date): Promise<GetWaterResult> {
    const targetDate = date ?? new Date();
    const entries = await this.waterRepository.findByUserIdAndDate(userId, targetDate);
    const totalMl = await this.waterRepository.getTotalByUserIdAndDate(userId, targetDate);
    return { entries, totalMl };
  }

  async getHistory(userId: string, limit = 30): Promise<WaterIntake[]> {
    return this.waterRepository.findByUserId(userId, limit, 0);
  }
}

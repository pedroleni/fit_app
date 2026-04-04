import { WaterIntake, CreateWaterIntakeDto } from '../../../domain/entities/WaterIntake';
import { WaterRepository } from '../../../domain/ports/WaterRepository';

export class LogWaterUseCase {
  constructor(private readonly waterRepository: WaterRepository) {}

  async execute(data: CreateWaterIntakeDto): Promise<WaterIntake> {
    return this.waterRepository.create(data);
  }
}

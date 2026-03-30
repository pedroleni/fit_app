import { Workout, CreateWorkoutDto } from '../../../domain/entities/Workout';
import { WorkoutRepository } from '../../../domain/ports/WorkoutRepository';

export class CreateWorkoutUseCase {
  constructor(private readonly workoutRepository: WorkoutRepository) {}

  async execute(data: CreateWorkoutDto): Promise<Workout> {
    return this.workoutRepository.create(data);
  }
}

import { Workout } from '../../../domain/entities/Workout';
import { WorkoutRepository } from '../../../domain/ports/WorkoutRepository';

interface GetWorkoutsOptions {
  userId: string;
  limit?: number;
  skip?: number;
}

export class GetWorkoutsUseCase {
  constructor(private readonly workoutRepository: WorkoutRepository) {}

  async execute(options: GetWorkoutsOptions): Promise<{ workouts: Workout[]; total: number }> {
    const { userId, limit = 20, skip = 0 } = options;
    const [workouts, total] = await Promise.all([
      this.workoutRepository.findByUserId(userId, limit, skip),
      this.workoutRepository.countByUserId(userId),
    ]);
    return { workouts, total };
  }
}

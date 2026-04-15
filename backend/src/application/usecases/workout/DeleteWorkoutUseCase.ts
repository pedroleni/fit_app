import { WorkoutRepository } from '../../../domain/ports/WorkoutRepository';

export class DeleteWorkoutUseCase {
  constructor(private readonly workoutRepository: WorkoutRepository) {}

  async execute(id: string, userId: string): Promise<boolean> {
    const workout = await this.workoutRepository.findById(id);
    if (!workout || workout.userId !== userId) {
      throw new Error('Workout not found or unauthorized');
    }
    return this.workoutRepository.delete(id, userId);
  }
}

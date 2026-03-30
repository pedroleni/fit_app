export type WorkoutType =
  | 'cardio'
  | 'strength'
  | 'flexibility'
  | 'sports'
  | 'other';

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;   // kg
  duration?: number; // minutes
  notes?: string;
}

export interface Workout {
  id: string;
  userId: string;
  title: string;
  type: WorkoutType;
  duration: number;      // minutes
  calories?: number;
  exercises: Exercise[];
  notes?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateWorkoutDto = Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>;

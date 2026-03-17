export type Gender = 'hombre' | 'mujer' | 'otro';
export type Rol = 'admin' | 'user';

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  gender?: Gender;
  image?: string;    // avatar URL (de Google o propia)
  rol: Rol;
  createdAt: string;
  updatedAt: string;
}

export type WorkoutType = 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  notes?: string;
}

export interface Workout {
  id: string;
  userId: string;
  title: string;
  type: WorkoutType;
  duration: number;
  calories?: number;
  exercises: Exercise[];
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaterIntake {
  id: string;
  userId: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── AI Exercise & Routine types (from Pruebas) ───────────────────────────────

export interface AIExercise {
  nombre: string;
  complejidad: 'principiante' | 'intermedio' | 'avanzado';
  grupoMuscular: string;
  caloriasEstimadas: number;
  descripcion: string;
  imagenQuery: string;
  imagen?: string;
}

export interface RoutineExercise {
  nombre: string;
  series: number;
  repeticiones: string;
  descansoSegundos: number;
  duracionMinutos: number;
  grupoMuscular: string;
  complejidad: 'principiante' | 'intermedio' | 'avanzado';
  caloriasEstimadas: number;
  notas?: string;
  videoId?: string;
  imagen?: string;
}

export interface RoutineDay {
  dia: string;
  enfoque: string;
  duracionTotal: number;
  ejercicios: RoutineExercise[];
  calentamiento: string;
  enfriamiento: string;
  caloriasDelDia: number;
}

export interface AIRoutine {
  resumen: string;
  diasDescanso: string[];
  caloriasSemanalesEstimadas: number;
  dias: RoutineDay[];
}

export interface ActiveWorkoutLog {
  weight: string;
  reps: string;
  completed: boolean;
}

export interface ActiveWorkoutExercise extends RoutineExercise {
  logs: ActiveWorkoutLog[];
}

export interface CompletedWorkoutSession {
  dia: string;
  enfoque: string;
  duracionTotal: number;
  caloriasDelDia: number;
  ejercicios: ActiveWorkoutExercise[];
  date: string;
  duration: number; // actual minutes
}

export interface AIExercise {
  nombre: string;
  complejidad: 'principiante' | 'intermedio' | 'avanzado';
  grupoMuscular: string;
  caloriasEstimadas: number;
  descripcion: string;
  imagenQuery: string;
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

export interface FetchExercisesInput {
  muscleGroup: string;
  weight: number;
  height: number;
}

export interface GenerateRoutineInput {
  days: string[];
  duration: number;
  weight: number;
  height: number;
}

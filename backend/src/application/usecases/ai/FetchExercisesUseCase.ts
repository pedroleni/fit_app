import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIExercise, FetchExercisesInput } from '../../../domain/entities/AIExercise';
import { GeminiError } from './AskGeminiUseCase';
import { getExerciseImage } from './exerciseImages';

const GEMINI_MODEL = 'gemini-2.5-flash';

function parseJsonResponse<T>(text: string): T {
  let clean = text.trim();
  if (clean.startsWith('```json')) clean = clean.slice(7);
  else if (clean.startsWith('```')) clean = clean.slice(3);
  if (clean.endsWith('```')) clean = clean.slice(0, -3);
  clean = clean.trim();
  try {
    return JSON.parse(clean) as T;
  } catch {
    throw new GeminiError('Error al procesar la respuesta de la IA. Intenta de nuevo.', 502);
  }
}

export class FetchExercisesUseCase {
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async execute(input: FetchExercisesInput): Promise<AIExercise[]> {
    const { muscleGroup, weight, height } = input;
    const model = this.genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `Eres un experto en fitness y nutrición deportiva. Dame exactamente 6 ejercicios para el grupo muscular "${muscleGroup}".

Para cada ejercicio, calcula las calorías estimadas que se quemarían en 30 minutos para una persona de ${weight} kg y ${height} cm de altura.

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin backticks, sin texto adicional) con la siguiente estructura:
[
  {
    "nombre": "Nombre del ejercicio",
    "complejidad": "principiante" | "intermedio" | "avanzado",
    "grupoMuscular": "${muscleGroup}",
    "caloriasEstimadas": número (calorías en 30 min),
    "descripcion": "Breve descripción de cómo realizar el ejercicio",
    "imagenQuery": "término de búsqueda en inglés para encontrar una imagen del ejercicio (ej: 'bench press exercise')"
  }
]

Asegúrate de que:
- Los nombres están en español
- La complejidad varía entre los 3 niveles
- Las calorías son realistas según el peso y altura dados
- La descripción es clara y concisa`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) throw new GeminiError('No se recibió respuesta de la IA', 502);

    const exercises = parseJsonResponse<AIExercise[]>(text);
    if (!Array.isArray(exercises)) {
      throw new GeminiError('La IA no devolvió un array de ejercicios', 502);
    }

    return exercises.map((ex, i) => ({
      ...ex,
      imagen: getExerciseImage(ex.grupoMuscular || muscleGroup, i),
    }));
  }
}

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIRoutine, GenerateRoutineInput } from '../../../domain/entities/AIExercise';
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

export class GenerateRoutineUseCase {
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async execute(input: GenerateRoutineInput): Promise<AIRoutine> {
    const { days, duration, weight, height } = input;
    const dayNames = days.join(', ');
    const model = this.genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `Eres un entrenador personal experto. Crea una rutina de entrenamiento semanal completa.

Datos del usuario:
- Peso: ${weight} kg
- Altura: ${height} cm
- Días de entrenamiento: ${dayNames}
- Duración por sesión: ${duration} minutos

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin backticks, sin texto adicional) con esta estructura:
{
  "resumen": "Descripción breve de la rutina y su objetivo",
  "diasDescanso": ["días de la semana que son de descanso"],
  "caloriasSemanalesEstimadas": número,
  "dias": [
    {
      "dia": "Lunes",
      "enfoque": "Nombre del enfoque del día (ej: Pecho y Tríceps)",
      "duracionTotal": ${duration},
      "ejercicios": [
        {
          "nombre": "Nombre del ejercicio",
          "series": número,
          "repeticiones": "12-15" o "30 seg" para isométricos,
          "descansoSegundos": número,
          "duracionMinutos": número,
          "grupoMuscular": "grupo muscular principal",
          "complejidad": "principiante" | "intermedio" | "avanzado",
          "caloriasEstimadas": número,
          "notas": "Consejos de ejecución o variaciones",
          "videoId": "ID de un video de YouTube real y corto sobre este ejercicio (ej 'IODxNxXQooU')"
        }
      ],
      "calentamiento": "Describe el calentamiento recomendado (3-5 min)",
      "enfriamiento": "Describe el enfriamiento recomendado (3-5 min)",
      "caloriasDelDia": número
    }
  ]
}

Reglas:
- Los nombres de ejercicios en español
- La suma de duracionMinutos de los ejercicios + calentamiento + enfriamiento debe ser ≈ ${duration} min
- Descansos realistas: 30-90s para ejercicios ligeros, 90-180s para compuestos pesados
- Calorías realistas para ${weight}kg y ${height}cm
- Para "videoId", proporciona SOLO el ID de YouTube de 11 caracteres. Intenta que sea un ID real de un tutorial de ese ejercicio.
- Varía los grupos musculares entre días para una distribución equilibrada
- CRÍTICO: DEBES generar un objeto de entrenamiento para CADA UNO de estos días exactamente: ${dayNames}. ¡No omitas NINGÚN día!
- Si un día no está en la lista (${dayNames}), inclúyelo obligatoriamente en el array "diasDescanso".
- Ordena los ejercicios de más compuestos a más aislados`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) throw new GeminiError('No se recibió respuesta de la IA', 502);

    const routine = parseJsonResponse<AIRoutine>(text);
    if (!routine.dias || !Array.isArray(routine.dias)) {
      throw new GeminiError('La IA no devolvió una rutina válida', 502);
    }

    // Attach Unsplash images to every exercise in the routine
    routine.dias = routine.dias.map((dia) => ({
      ...dia,
      ejercicios: dia.ejercicios.map((ex, i) => ({
        ...ex,
        imagen: getExerciseImage(ex.grupoMuscular ?? '', i),
      })),
    }));

    return routine;
  }
}

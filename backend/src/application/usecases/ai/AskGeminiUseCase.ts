import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AskGeminiInput {
  message: string;
  userContext?: {
    name: string;
    recentWorkouts?: string[];
    dailyWaterMl?: number;
  };
}

/** Error con statusCode para que el controller pueda devolver el código HTTP correcto */
export class GeminiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

export class AskGeminiUseCase {
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async execute(input: AskGeminiInput): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `Eres FitAI, un coach de fitness y salud personalizado y motivador. 
Ayudas a los usuarios con planes de entrenamiento, nutrición, hidratación y consejos de bienestar general.
Responde siempre en español, de forma amigable, clara y motivadora.
Basa tus recomendaciones en datos científicos y adapta las respuestas al contexto del usuario.`;

    let contextBlock = '';
    if (input.userContext) {
      const { name, recentWorkouts, dailyWaterMl } = input.userContext;
      contextBlock = `\n\nContexto del usuario:
- Nombre: ${name}
${recentWorkouts && recentWorkouts.length > 0 ? `- Entrenamientos recientes: ${recentWorkouts.join(', ')}` : ''}
${dailyWaterMl !== undefined ? `- Agua consumida hoy: ${dailyWaterMl} ml` : ''}`;
    }

    const fullPrompt = `${systemPrompt}${contextBlock}\n\nUsuario: ${input.message}`;

    return this.generateWithRetry(model, fullPrompt);
  }

  /** Reintenta hasta 3 veces con backoff exponencial en caso de 429 */
  private async generateWithRetry(
    model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>,
    prompt: string,
    maxAttempts = 3,
  ): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (!text) throw new GeminiError('Gemini devolvió una respuesta vacía', 502);
        return text;
      } catch (err: unknown) {
        const errStr = String(err);
        const isRateLimit =
          (err as { status?: number })?.status === 429 ||
          errStr.includes('429') ||
          errStr.includes('RESOURCE_EXHAUSTED');

        if (isRateLimit) {
          if (attempt < maxAttempts - 1) {
            const delay = 1000 * 2 ** attempt; // 1s → 2s → 4s
            console.warn(`⏳ Gemini 429 — reintentando en ${delay}ms (intento ${attempt + 1}/${maxAttempts})`);
            await new Promise((r) => setTimeout(r, delay));
          } else {
            throw new GeminiError(
              'El servicio de IA está temporalmente saturado. Por favor, espera unos segundos e inténtalo de nuevo.',
              429,
            );
          }
        } else {
          throw err;
        }
      }
    }
    throw new GeminiError('Máximo de reintentos alcanzado', 429);
  }
}

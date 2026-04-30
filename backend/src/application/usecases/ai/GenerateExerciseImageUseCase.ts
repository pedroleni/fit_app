import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExerciseImageModel } from '../../../infrastructure/db/models/ExerciseImageModel';
import { GeminiError } from './AskGeminiUseCase';

/**
 * Generates (or retrieves from DB cache) a realistic image for a given exercise.
 * Images are stored as base64 in MongoDB keyed by the normalised exercise name.
 */
export class GenerateExerciseImageUseCase {
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private normalizeName(name: string): string {
    return (name ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  async execute(
    nombreEjercicio: string,
    grupoMuscular: string
  ): Promise<{ imageBase64: string; mimeType: string }> {
    const key = this.normalizeName(nombreEjercicio);

    // ── 1. Check DB cache first ──
    const cached = await ExerciseImageModel.findOne({ name: key }).lean();
    if (cached) {
      return { imageBase64: cached.imageBase64, mimeType: cached.mimeType };
    }

    // ── 2. Generate with Gemini image model ──
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-preview-image-generation',
      // ResponseModalities must include IMAGE to get image output
      // The type definition may not yet expose this — cast as needed
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
        responseMimeType: 'image/png',
      } as Record<string, unknown>,
    });

    const prompt =
      `A high-quality, fun 3D animated style illustration of a muscular anthropomorphic BANANA character ` +
      `correctly performing the exercise "${nombreEjercicio}" (muscle group: ${grupoMuscular}). ` +
      `The banana should be lifting weights or doing the movement. ` +
      `Gym background, vibrant colors, cinematic lighting, no text, no watermarks, masterfully detailed.`;

    let imageBase64: string;
    let mimeType = 'image/png';

    try {
      const result = await model.generateContent(prompt);
      const candidate = result.response.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find(
        (p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData?.data
      );

      if (!imagePart?.inlineData?.data) {
        throw new GeminiError('Gemini did not return image data', 502);
      }

      imageBase64 = imagePart.inlineData.data;
      mimeType = imagePart.inlineData.mimeType ?? 'image/png';
    } catch (err: unknown) {
      if (err instanceof GeminiError) throw err;
      throw new GeminiError(
        `Error generating image: ${err instanceof Error ? err.message : String(err)}`,
        502
      );
    }

    // ── 3. Cache in MongoDB (upsert to avoid race conditions) ──
    await ExerciseImageModel.findOneAndUpdate(
      { name: key },
      { name: key, imageBase64, mimeType },
      { upsert: true, new: true }
    );

    return { imageBase64, mimeType };
  }
}

import mongoose, { Document, Schema } from 'mongoose';

export interface IExerciseImage extends Document {
  name: string;        // normalized lowercase exercise name (cache key)
  imageBase64: string; // base64 encoded image
  mimeType: string;    // e.g. 'image/png'
  createdAt: Date;
}

const ExerciseImageSchema = new Schema<IExerciseImage>(
  {
    name: { type: String, required: true, unique: true, index: true },
    imageBase64: { type: String, required: true },
    mimeType: { type: String, required: true, default: 'image/png' },
  },
  { timestamps: true }
);

export const ExerciseImageModel = mongoose.model<IExerciseImage>(
  'ExerciseImage',
  ExerciseImageSchema
);

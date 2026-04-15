import mongoose, { Document, Schema } from 'mongoose';
import { WaterIntake } from '../../../domain/entities/WaterIntake';

export interface WaterDocument extends Omit<WaterIntake, 'id'>, Document {}

const WaterSchema = new Schema<WaterDocument>(
  {
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export const WaterModel = mongoose.model<WaterDocument>('WaterIntake', WaterSchema);

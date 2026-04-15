import mongoose, { Document, Schema } from 'mongoose';
import { Workout, Exercise, WorkoutType } from '../../../domain/entities/Workout';

export interface WorkoutDocument extends Omit<Workout, 'id'>, Document {}

const ExerciseSchema = new Schema<Exercise>(
  {
    name: { type: String, required: true, trim: true },
    sets: { type: Number },
    reps: { type: Number },
    weight: { type: Number },
    duration: { type: Number },
    notes: { type: String },
  },
  { _id: false }
);

const WorkoutSchema = new Schema<WorkoutDocument>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['cardio', 'strength', 'flexibility', 'sports', 'other'] as WorkoutType[],
      required: true,
    },
    duration: { type: Number, required: true },
    calories: { type: Number },
    exercises: { type: [ExerciseSchema], default: [] },
    notes: { type: String },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export const WorkoutModel = mongoose.model<WorkoutDocument>('Workout', WorkoutSchema);

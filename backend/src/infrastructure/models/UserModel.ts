import mongoose, { Document, Schema } from 'mongoose';
import validator from 'validator';
import { User, Gender, Rol } from '../../../domain/entities/User';

export interface UserDocument extends Omit<User, 'id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Email no válido'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['hombre', 'mujer', 'otro'] as Gender[],
      // opcional: Google no lo provee; el usuario lo puede actualizar después
    },
    image: {
      // URL del avatar (Google photo o imagen propia)
      type: String,
      default: 'https://pic.onlinewebfonts.com/svg/img_181369.png',
    },
    rol: {
      type: String,
      enum: ['admin', 'user'] as Rol[],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);

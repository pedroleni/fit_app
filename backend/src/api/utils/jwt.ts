import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export interface JwtPayload {
  id: string;
  email: string;
}

export const generateToken = (id: string, email: string): string => {
  if (!id || !email) throw new Error('id and email are required to generate token');
  return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  if (!token) throw new Error('Token is missing');
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

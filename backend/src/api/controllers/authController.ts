import { Request, Response } from 'express';
import passport from 'passport';
import { generateToken } from '../utils/jwt';
import { User } from '../../domain/entities/User';

// Initiates Google OAuth
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

// Called by Google after OAuth consent
export const googleCallback = [
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req: Request, res: Response): void => {
    const user = req.user as User;
    const token = generateToken(user.id, user.email);
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    // Redirect to frontend with token in query param (frontend reads it and stores in localStorage)
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  },
];

// GET /auth/me — returns current user profile
export const getMe = (req: Request, res: Response): void => {
  res.status(200).json({ user: req.user });
};

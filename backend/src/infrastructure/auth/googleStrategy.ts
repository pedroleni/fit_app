import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { GoogleAuthUseCase } from '../../application/usecases/auth/GoogleAuthUseCase';
import { MongoUserRepository } from '../repositories/MongoUserRepository';

const userRepository = new MongoUserRepository();
const googleAuthUseCase = new GoogleAuthUseCase(userRepository);

export function configurePassport(): void {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
        try {
          const user = await googleAuthUseCase.execute({
            googleId: profile.id,
            email: profile.emails?.[0]?.value ?? '',
            name: profile.displayName,
            image: profile.photos?.[0]?.value, // avatar de Google
          });
          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

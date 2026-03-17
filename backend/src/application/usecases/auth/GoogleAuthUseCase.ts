import { User, CreateUserDto } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/UserRepository';

interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  image?: string; // avatar URL de Google
}

export class GoogleAuthUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(profile: GoogleProfile): Promise<User> {
    // Try to find existing user by googleId
    let user = await this.userRepository.findByGoogleId(profile.googleId);

    if (user) {
      return user;
    }

    // Try to find by email (user might have registered before)
    user = await this.userRepository.findByEmail(profile.email);

    if (user) {
      // Vincular cuenta de Google al usuario ya existente
      const updated = await this.userRepository.update(user.id, {
        googleId: profile.googleId,
        image: profile.image ?? user.image,
      });
      return updated!;
    }

    // Crear nuevo usuario desde el perfil de Google
    const newUserData: CreateUserDto = {
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      image: profile.image,   // avatar de Google
      rol: 'user',
    };

    return this.userRepository.create(newUserData);
  }
}

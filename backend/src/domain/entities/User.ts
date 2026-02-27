/**
 * User entity — estructura equivalente al modelo de referencia:
 * email, name, gender, rol, image
 * + googleId (reemplaza a password / confirmationCode / check del ref)
 */
export type Gender = 'hombre' | 'mujer' | 'otro';
export type Rol = 'admin' | 'user';

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  gender?: Gender;      // opcional: Google no lo provee, el usuario lo puede fijar después
  image?: string;       // URL de avatar (de Google o subida por el usuario)
  rol: Rol;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserDto = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

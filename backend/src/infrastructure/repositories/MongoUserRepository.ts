import { UserRepository } from '../../../domain/ports/UserRepository';
import { User, CreateUserDto } from '../../../domain/entities/User';
import { UserModel, UserDocument } from '../models/UserModel';

function toEntity(doc: UserDocument): User {
  return {
    id: doc._id.toString(),
    googleId: doc.googleId,
    email: doc.email,
    name: doc.name,
    gender: doc.gender,
    image: doc.image,
    rol: doc.rol,
    createdAt: doc.createdAt as Date,
    updatedAt: doc.updatedAt as Date,
  };
}

export class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? toEntity(doc) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const doc = await UserModel.findOne({ googleId });
    return doc ? toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() });
    return doc ? toEntity(doc) : null;
  }

  async create(data: CreateUserDto): Promise<User> {
    const doc = await UserModel.create(data);
    return toEntity(doc);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, data, { new: true });
    return doc ? toEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  }
}

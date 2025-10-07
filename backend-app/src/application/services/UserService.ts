import { User } from '@prisma/client';
import { IUserRepository } from '../../domaine/repositories/IUserRepository';
import { CreateUserEntity, UpdateUserEntity } from '../../domaine/entities/User';

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async createUser(userData: CreateUserEntity): Promise<User> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    return await this.userRepository.create(userData);
  }

  async updateUser(id: string, userData: UpdateUserEntity): Promise<User> {
    // Vérifier si l'utilisateur existe
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé');
    }

    // Si on change l'email, vérifier qu'il n'est pas déjà pris
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.userRepository.findByEmail(userData.email);
      if (emailExists) {
        throw new Error('Cet email est déjà utilisé');
      }
    }

    return await this.userRepository.update(id, userData);
  }

  async deleteUser(id: string): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé');
    }

    return await this.userRepository.delete(id);
  }
}

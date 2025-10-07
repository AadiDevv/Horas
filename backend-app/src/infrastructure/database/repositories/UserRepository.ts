import { User, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { IUserRepository } from '../../../domaine/repositories/IUserRepository';

export class UserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    return await prisma.user.findMany({
      include: {
        posts: true
      }
    });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        posts: true
      }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        posts: true
      }
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await prisma.user.create({
      data,
      include: {
        posts: true
      }
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
      include: {
        posts: true
      }
    });
  }

  async delete(id: string): Promise<User> {
    return await prisma.user.delete({
      where: { id },
      include: {
        posts: true
      }
    });
  }
}

import { IAuth } from "@/domain/interfaces/auth.interface";
import { User } from "@/domain/entities/user";
import { prisma } from "../prisma.service";
import { NotFoundError, ValidationError, InvalidCredentialsError } from "@/domain/error/AppError";

export class UserRepository implements IAuth {


  // #region Read
  async getAllUsers(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users.map(user => new User({ ...user }));
  }

  async getUser_ById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({ where: { id } }) as User
    } catch (error) {
      throw new NotFoundError(`Error fetching user by id: ${error}`);
    }
  }
  async getUser_ByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } }) as User | null;
    if (!user) return null
    return new User({ ...user })
  }


  // #endregion
  // #region Update
  async updateUser_byId(user: User): Promise<User> {
    if (!user.id) {
      throw new Error('Cannot update user without ID');
    }

    const { id, createdAt, updatedAt, ...updateData } = user

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
            updatedAt: new Date(Date.now())
        }
    })
    return new User({ ...updatedUser })
  }
  async updateUserLogin_byId(user: User): Promise<User> {
    if (!user.id) {
      throw new Error('Cannot update user without ID');
    }

    const { lastLoginAt, id, ...updateData } = user

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: lastLoginAt
      }
    })
    return new User({ ...updatedUser })
  }

  // #endregion
  // #region Delete

  async deleteUser_ById(user: User): Promise<User> {
    if (!user.id) throw new ValidationError('Cannot update user without ID')
    return await prisma.user.delete({
      where: { id: user.id }
    }) as User
  }
  // #endregion
  // #region Auth
  async registerUser(user: User): Promise<User> {
    const createdUser = await prisma.user.create({
      data: {
        ...user,
        lastLoginAt: new Date(Date.now()),
      },
    })

    return new User({ ...createdUser });
  }



  // #endregion
}




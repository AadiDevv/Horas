import { IAuth } from "@/domain/interfaces/auth.interface";
import { IUser } from "@/domain/interfaces/user.interface";
import { User } from "@/domain/entities/user";
import { prisma } from "../prisma.service";
import { NotFoundError } from "@/domain/error/AppError";
import { nullToUndefined } from "@/shared/utils/prisma.helpers";
import { UserFilterDTO } from "@/application/DTOS/user.dto";

/**
 * Repository pour les opérations User et Auth
 * Implémente IAuth (register/login) et IUser (CRUD)
 */
export class UserRepository implements IAuth, IUser {


  // #region Read (IUser + IAuth)
  /**
   * Récupère tous les utilisateurs avec filtres optionnels
   * Utilisé par Admin pour lister/filtrer les users
   */
  async getAllUsers(filter?: UserFilterDTO): Promise<User[]> {
    const { role, teamId, isActive, search } = filter || {};

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(teamId !== undefined && { teamId }),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }),
        deletedAt: null // N'afficher que les users non supprimés
      },
      include: {
        team: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return users.map(user => new User(nullToUndefined(user)));
  }

  async getUser_ById(id: number): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;
      return new User(nullToUndefined(user));
    } catch (error) {
      throw new NotFoundError(`Error fetching user by id: ${error}`);
    }
  }
  async getUser_ByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return new User(nullToUndefined(user));
  }

  /**
   * Récupère tous les employés d'un manager spécifique
   * JOIN : User (manager) → Team (managerId) → User (members via teamId)
   * 
   * @param managerId - ID du manager
   * @returns Liste des employés appartenant aux équipes du manager
   */
  async getEmployees_ByManagerId(managerId: number): Promise<User[]> {
    // Récupérer tous les users qui ont un teamId correspondant aux équipes du manager
    const employees = await prisma.user.findMany({
      where: {
        team: {
          managerId: managerId
        },
        deletedAt: null // Exclure les users supprimés
      },
      include: {
        team: {
          select: {
            id: true,
            name: true
          }
        },
        schedule: {
          select: {
            id: true,
            name: true,
            startHour: true,
            endHour: true
          }
        }
      },
      orderBy: [
        { team: { name: 'asc' } }, // Trier par équipe
        { firstName: 'asc' }         // Puis par prénom
      ]
    });

    return employees.map(employee => new User(nullToUndefined({ ...employee, team: employee.team ?? undefined, schedule: employee.schedule ?? undefined })));
  }
  // #endregion
  // #region Update (IAuth + IUser)
  async updateUser_ById(user: User): Promise<User> {
    if (!user.id) {
      throw new Error('Cannot update user without ID');
    }

    const { id, createdAt, updatedAt, deletedAt, lastLoginAt, manager, employes, team, schedule, ...updateData } = user

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...nullToUndefined(updateData),
        updatedAt: new Date(Date.now())
      }
    })
    return new User(nullToUndefined(updatedUser))
  }

  async updateUserLogin_byId(user: User): Promise<User> {
    if (!user.id) {
      throw new Error('Cannot update user without ID');
    }

    const { lastLoginAt, id } = user

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: lastLoginAt
      }
    })
    return new User(nullToUndefined(updatedUser))
  }

  // #endregion
  // #region Delete
  /**
   * Suppression logique (soft delete) d'un utilisateur
   * Met à jour le champ deletedAt au lieu de supprimer physiquement
   * 
   * @param id - ID de l'utilisateur à supprimer
   * @returns L'utilisateur avec deletedAt défini
   */
  async deleteUser_ById(id: number): Promise<User> {
    const deletedUser = await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return new User(nullToUndefined(deletedUser));
  }
  // #endregion
  // #region Auth
  async registerUser(user: User): Promise<User> {
    const { id, createdAt, updatedAt, deletedAt, lastLoginAt, manager, schedule, team, employes, ...userData } = user

    if (!userData.hashedPassword) {
      throw new Error('Le mot de passe hashé est requis pour créer un utilisateur');
    }

    const createdUser = await prisma.user.create({
      data: {
        ...userData,
        managerId: manager?.id!,
        scheduleId: schedule?.id,
        teamId: team?.id,
        hashedPassword: userData.hashedPassword,
      },
    })

    return new User(nullToUndefined(createdUser));
  }
  async registerManager(user: User): Promise<User> {
    const { id, createdAt, updatedAt, deletedAt, lastLoginAt, manager, schedule, team, employes, ...userData } = user

    if (!userData.hashedPassword) {
      throw new Error('Le mot de passe hashé est requis pour créer un manager');
    }

    const createdUser = await prisma.user.create({
      data: {
        ...userData,
        hashedPassword: userData.hashedPassword,
      },
    })

    return new User(nullToUndefined(createdUser));
  }
  async registerEmployee(user: User): Promise<User> {
    const { id, createdAt, updatedAt, deletedAt, lastLoginAt, manager, schedule, team, employes, ...userData } = user

    if (!userData.hashedPassword) {
      throw new Error('Le mot de passe hashé est requis pour créer un employé');
    }
    if (!manager?.id) {
      throw new Error('Le manager ID est requis pour créer un employé');
    }

    // A faire = faire un get team et recuperer le scheadule de la team assigner a lemployé
    const createdUser = await prisma.user.create({
      data: {
        ...userData,
        managerId: manager.id,
        scheduleId: schedule?.id,
        teamId: team?.id,
        hashedPassword: userData.hashedPassword,
      },
    })

    return new User(nullToUndefined(createdUser));
  }
  // #endregion
}




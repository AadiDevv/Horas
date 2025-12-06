import { IAuth } from "@/domain/interfaces/auth.interface";
import { IUser } from "@/domain/interfaces/user.interface";
import { User, UserEmployee_Core, UserManager_Core, Schedule_Core, UserEmployee, UserEmployee_L1 } from "@/domain/entities/";
import { prisma } from "../prisma.service";
import { NotFoundError } from "@/domain/error/AppError";
import { nullToUndefined } from "@/shared/utils/prisma.helpers";
import { SCHEDULE_CORE_SELECT, TEAM_CORE_SELECT, USER_EMPLOYEE_CORE_SELECT, USER_MANAGER_CORE_SELECT } from "@/infrastructure/prismaUtils/selectConfigs";
import { Team_Core } from "@/domain/entities/team";
import { User as PrismaUser } from "@/generated/prisma";
import { TeamProps_Core, UserManagerProps_Core } from "@/domain/types/entitiyProps";


/**
 * Repository pour les opérations User et Auth
 * Implémente IAuth (register/login) et IUser (CRUD)
 */
export class UserRepository implements IAuth, IUser {

  private toUserEmployee(user: PrismaUser & {
    team: (Omit<TeamProps_Core, 'membersCount'> & { _count: { members: number } }) | null,
    manager: UserManagerProps_Core | null
  }): UserEmployee {
    return new UserEmployee({
      ...user,
      managerId: user.managerId!,
      team: user.team ? new Team_Core({
        ...user.team,
        membersCount: user.team._count.members
      }) : null,
      manager: user.manager ? new UserManager_Core(user.manager) : null as any,
      customSchedule: null,
      customScheduleId: null,
    });
  }

  // #region GET
  async getEmployee_ById(id: number): Promise<UserEmployee> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          team: {
            select: {
              ...TEAM_CORE_SELECT,
              _count: {
                select: {
                  members: true
                }
              }
            }
          },
          manager: {
            select: {
              ...USER_MANAGER_CORE_SELECT
            }
          },
        }
      });
      if (!user) throw new NotFoundError(`User with id ${id} not found`);
      return this.toUserEmployee(user);
    } catch (error) {
      throw new NotFoundError(`Error fetching user by id: ${error}`);
    }
  }

  async getEmployee_ByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          team: {
            select: {
              ...TEAM_CORE_SELECT,
              _count: {
                select: {
                  members: true
                }
              }
            }
          },
          manager: {
            select: {
              ...USER_MANAGER_CORE_SELECT
            }
          },
          customSchedule: {
            select: {
              ...SCHEDULE_CORE_SELECT
            }
          }
        }
      });
      if (!user) throw new NotFoundError(`User with email ${email} not found`);
      return this.toUserEmployee(user);
    } catch (error) {
      throw new NotFoundError(`Error fetching user by email: ${error}`);
    }
  }

  /**
   * Récupère tous les employés d'un manager spécifique
   * JOIN : User (manager) → Team (managerId) → User (members via teamId)
   * 
   * @param managerId - ID du manager
   * @returns Liste des employés appartenant aux équipes du manager
   */
  async getEmployees_ByManagerId(managerId: number): Promise<UserEmployee_Core[]> {
    // Récupérer tous les users qui ont un teamId correspondant aux équipes du manager
    const employees = await prisma.user.findMany({
      where: {
        manager: {
          id: managerId
        },
        deletedAt: null // Exclure les users supprimés
      },
      select: {
        ...USER_EMPLOYEE_CORE_SELECT,
      },
      orderBy: [
        { team: { name: 'asc' } }, // Trier par équipe
        { firstName: 'asc' }         // Puis par prénom
      ]
    });

    return employees.map(employee => new UserEmployee_Core({
      ...employee,
      managerId: employee.managerId!,
      customScheduleId: null,
    }));
  }
  // #endregion
  // #region Update (IAuth + IUser)
  async updateEmployeeProfile_ById(user: UserEmployee_Core): Promise<UserEmployee_Core> {
    if (!user.id) {
      throw new Error('Cannot update user without ID');
    }

    const { managerId, customScheduleId, teamId, ...updateData } = user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...nullToUndefined(updateData),
      },
      select: {
        ...USER_EMPLOYEE_CORE_SELECT,
      }
    })
    return new UserEmployee_Core({
      ...updatedUser,
      managerId: updatedUser.managerId!,
      customScheduleId: null,
    })
  }

  async updateUserTeam_ById(userId: number, teamIdParam: number): Promise<UserEmployee_Core> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        teamId: teamIdParam,
      },
      select: {
        ...USER_EMPLOYEE_CORE_SELECT,
      }
    })
    return new UserEmployee_Core({
      ...updatedUser,
      managerId: updatedUser.managerId!,
      customScheduleId: null,
    })
  }

  // a revoir
  async updateEmployeeLogin_byId(user: UserEmployee_L1): Promise<UserEmployee_L1> {
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
    return new UserEmployee_L1({
      ...updatedUser,
      managerId: updatedUser.managerId!,
      customScheduleId: null,
    })
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
  async deleteUser_ById(id: number): Promise<UserEmployee_L1> {
    const deletedUser = await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return new UserEmployee_L1({
      ...deletedUser,
      managerId: deletedUser.managerId!,
      customScheduleId: null,
    })
  }
  // #endregion
  // #region Auth
  async registerEmployee(user: UserEmployee_Core): Promise<UserEmployee_Core> {
    const { id, ...userData } = user

    if (!userData.hashedPassword) {
      throw new Error('Le mot de passe hashé est requis pour créer un employé');
    }
    if (!user.managerId) {
      throw new Error('Le manager ID est requis pour créer un employé');
    }

    const createdUser = await prisma.user.create({
      data: {
        ...userData,
      },
    })

    return new UserEmployee_Core({
      ...createdUser,
      managerId: createdUser.managerId!,
      customScheduleId: null,
    })
  }
  async registerManager(user: UserManager_Core): Promise<UserManager_Core> {
    const { id, ...userData } = user

    if (!userData.hashedPassword) {
      throw new Error('Le mot de passe hashé est requis pour créer un manager');
    }


    const createdUser = await prisma.user.create({
      data: {
        ...userData,
      },
    })

    return new UserManager_Core({
      ...createdUser,
    })
  }

  // #endregion
}




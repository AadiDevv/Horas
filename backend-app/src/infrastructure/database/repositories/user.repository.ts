import { IAuth } from "@/domain/interfaces/auth.interface";
import { IUser } from "@/domain/interfaces/user.interface";
import { User, UserEmployee_Core, UserManager_Core, Schedule_Core, UserEmployee, UserEmployee_L1, User_Core, User_L1, UserManager } from "@/domain/entities/";
import { prisma } from "../prisma.service";
import { NotFoundError } from "@/domain/error/AppError";
import { nullToUndefined } from "@/shared/utils/prisma.helpers";
import { SCHEDULE_CORE_SELECT, TEAM_CORE_SELECT, USER_CORE_SELECT, USER_EMPLOYEE_CORE_SELECT, USER_MANAGER_CORE_SELECT } from "@/infrastructure/prismaUtils/selectConfigs";
import { Team_Core } from "@/domain/entities/team";
import { User as PrismaUser } from "@prisma/client";
import { ScheduleProps_Core, TeamProps_Core, UserManagerProps_Core } from "@/domain/types/entitiyProps";
import { JsonValue } from "@prisma/client/runtime/library";


/**
 * Repository pour les opérations User et Auth
 * Implémente IAuth (register/login) et IUser (CRUD)
 */
export class UserRepository implements IAuth, IUser {

  private toUserEmployee(user: PrismaUser & {
    team: (Omit<TeamProps_Core, 'membersCount'> & { _count: { members: number } }) | null,
    manager: UserManagerProps_Core,
    customSchedule: (Omit<ScheduleProps_Core, 'activeDays'> & { activeDays: JsonValue }) | null,
  }): UserEmployee {
    return new UserEmployee({
      ...user,
      managerId: user.managerId!,
      team: user.team ? new Team_Core({
        ...user.team,
        membersCount: user.team._count.members
      }) : null,
      manager: new UserManager_Core(user.manager),
      customSchedule: user.customSchedule ? new Schedule_Core({ ...user.customSchedule , activeDays: user.customSchedule.activeDays as number[] }) : null,
      customScheduleId: user.customScheduleId,
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
          customSchedule: {
            select: {
              ...SCHEDULE_CORE_SELECT
            }
          }
        }
      });
      if (!user) throw new NotFoundError(`User with id ${id} not found`);
      if (!user.manager) throw new NotFoundError(`Manager not found for employee with id ${id}`);
      return this.toUserEmployee(user as typeof user & { manager: UserManagerProps_Core });
    } catch (error) {
      // Re-throw NotFoundError as-is, wrap other errors
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new NotFoundError(`Error fetching user by id: ${error}`);
    }
  }

  async getManager_ById(id: number): Promise<UserManager> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          employes: {
            select: {
              ...USER_EMPLOYEE_CORE_SELECT
            }
          },
          managedTeams: {
            select: {
              ...TEAM_CORE_SELECT
            }
          }
        }
      });
      if (!user) throw new NotFoundError(`User with id ${id} not found`);
      return new UserManager({
        ...user,
        employes: user.employes.map(employee => new UserEmployee_Core({ ...employee, managerId: employee.managerId!, customScheduleId: employee.customScheduleId })),
        managedTeams: user.managedTeams.map(team => new Team_Core({ ...team, membersCount: team._count.members })),
      });
    }
    catch (error) {
      throw new NotFoundError(`Error fetching manager by id: ${error}`);
    }
  }
 
  async getUser_ById(id: number): Promise<User_Core> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });
      if (!user) throw new NotFoundError(`User with id ${id} not found`);
      return new User_Core({ ...user });
    } catch (error) {
      throw new NotFoundError(`Error fetching user by id: ${error}`);
    }
  }

  async getUserL1_ByEmail(email: string): Promise<User_L1 | null> {
    try {
      const user = await prisma.user.findUnique({ where: { email, deletedAt: null }});
      if (!user) return null;
      return new User_L1({
        ...user,
      });
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

    employees.forEach((employee, index) => {
      console.log(`employee ${index}:`, employee);
    });
    return employees.map(employee => new UserEmployee_Core({
      ...employee,
      managerId: employee.managerId!,
    }));
  }
  // #endregion
  // #region Update (IAuth + IUser)
  async updateUserProfile_ById(user: User_Core): Promise<User_Core> {
    if (!user.id) {
      throw new Error('Cannot update user without ID');
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...nullToUndefined(user),
      },
      select: {
        ...USER_CORE_SELECT,
      }
    })
    return new User_Core({
      ...updatedUser,
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
    })
  }

  async updateUserCustomSchedule_ById(userId: number, scheduleId: number | null): Promise<UserEmployee_Core> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        customScheduleId: scheduleId,
      },
      select: {
        ...USER_EMPLOYEE_CORE_SELECT,
      }
    });
    
    return new UserEmployee_Core({
      ...updatedUser,
      managerId: updatedUser.managerId!,
    });
  }

  // a revoir
  async updateUserLogin_byId(user: User_L1): Promise<User_L1> {
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
    return new User_L1({
      ...updatedUser,
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
  async deleteUser_ById(id: number): Promise<User_L1> {
    const deletedUser = await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return new User_L1({
      ...deletedUser,
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




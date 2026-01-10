import { ISchedule } from "@/domain/interfaces/schedule.interface";
import { Schedule, Schedule_Core, Team_Core, UserManager_Core } from "@/domain/entities/";
import { prismaService } from "../prisma.service";
import { SCHEDULE_CORE_SELECT, SCHEDULE_JOINT_SELECT, TEAM_CORE_SELECT, USER_MANAGER_CORE_SELECT } from "@/infrastructure/prismaUtils/selectConfigs/"
import { NotFoundError } from "@/domain/error/AppError";


// #endregion

export class ScheduleRepository implements ISchedule {
    private prisma = prismaService.getInstance();

    // #region Read
    /**
     * Récupère tous les schedules avec filtres optionnels
     */
    async getAllSchedules(where?: any): Promise<Schedule_Core[]> {


        const schedules = await this.prisma.schedule.findMany({
            where,
            select: {
                ...SCHEDULE_CORE_SELECT,

            },
            orderBy: {
                name: 'asc'
            }
        });

        return schedules.map(schedule => (
            new Schedule_Core({ ...schedule, activeDays: schedule.activeDays as number[] })
        ));
    }
    /**
     * Récupère un schedule par son ID
     */
    async getSchedule_ById(id: number): Promise<Schedule> {
        const schedule = await this.prisma.schedule.findUnique({
            where: { id },
            select: {
                ...SCHEDULE_JOINT_SELECT,
            }
        });

        if (!schedule) {
            throw new NotFoundError(`Schedule avec l'ID ${id} non trouvé`);
        }

        return new Schedule({ 
            ...schedule,
             activeDays: schedule.activeDays as number[],
              teams: schedule?.teams?.map(team => new Team_Core({ ...team, membersCount: team._count.members })) ?? [],
              manager: new UserManager_Core({ ...schedule.manager }),
             });
    }


    /**
     * Récupère les schedules utilisés par une équipe spécifique
     */
    async getSchedules_ByTeamId(teamId: number): Promise<Schedule[]> {
        const schedules = await this.prisma.schedule.findMany({
            where: {
                teams: {
                    some: {
                        id: teamId
                    }
                }
            },
            include: {
                teams: {
                    select: TEAM_CORE_SELECT
                },
                manager: {
                    select: USER_MANAGER_CORE_SELECT
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return schedules.map(schedule => new Schedule({
            ...schedule,
            activeDays: schedule.activeDays as number[],
            teams: schedule?.teams?.map(team => new Team_Core({ ...team, membersCount: team._count.members })) ?? [],
            manager: new UserManager_Core({ ...schedule.manager }),
        }));
    }
    // #endregion

    // #region Create
    /**
     * Crée un nouveau schedule
     */
    async createSchedule(schedule: Schedule_Core): Promise<Schedule_Core> {
        const { id, ...scheduleData } = schedule;

        const createdSchedule = await this.prisma.schedule.create({
            data: {
                ...scheduleData
            },
            select: {
                ...SCHEDULE_CORE_SELECT,
            }
        });

        return new Schedule_Core({
            ...createdSchedule,
            activeDays: createdSchedule.activeDays as number[],
        });
    }
    // #endregion

    // #region Update
    /**
     * Met à jour un schedule
     */
    async updateSchedule_ById(schedule: Schedule_Core): Promise<Schedule_Core> {

        const { id, ...scheduleData } = schedule;

        const updatedSchedule = await this.prisma.schedule.update({
            where: { id: schedule.id },
            data: {
                ...scheduleData,
                updatedAt: new Date()
            }
        });

        return new Schedule_Core({
            ...updatedSchedule,
            activeDays: updatedSchedule.activeDays as number[],
        });
    }
    // #endregion

    // #region Delete
    /**
     * Supprime un schedule (hard delete)
     * ⚠️ Attention : Vérifier qu'aucun utilisateur/équipe n'utilise ce schedule
     */
    async deleteSchedule_ById(id: number): Promise<void> {
        // Vérifier d'abord si le schedule est en cours d'utilisation
        await this.prisma.schedule.delete({
            where: { id }
        });
    }
    // #endregion

    // #region Business Methods
    /**
     * Vérifie si un schedule est utilisé par des utilisateurs ou équipes
     */


    /**
     * Récupère le nombre d'utilisateurs utilisant un schedule
     */
    async getScheduleUsersCount(id: number): Promise<number> {
        return await this.prisma.team.count({
            where: { scheduleId: id }
        });
    }
    // #endregion

    // #region Private Helper Methods
   
    
    // #endregion
}

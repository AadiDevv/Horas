import { ISchedule } from "@/domain/interfaces/schedule.interface";
import { Schedule,Schedule_Core, Team } from "@/domain/entities/";
import { prismaService } from "../prisma.service";
import { Schedule as PrismaSchedule } from "@/generated/prisma";
import { SCHEDULE_CORE_SELECT, SCHEDULE_L1_SELECT,TEAM_CORE_SELECT } from "@/infrastructure/prismaUtils/selectConfigs/"

// #region Types et constantes pour éviter la répétition
type ScheduleTeamSelect = {
    id: number;
    name: string;
    managerId: number;
    createdAt: Date;
};

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
            new Schedule_Core({...schedule, activeDays : schedule.activeDays as number[]})
        ));
    }
    /**
     * Récupère un schedule par son ID
     */
    async getSchedule_ById(id: number): Promise<Schedule | null> {
        const schedule = await this.prisma.schedule.findUnique({
            where: { id },
            include: {
                teams: {
                    ...SCHEDULE_L1_SELECT,
                    select: TEAM_CORE_SELECT
                }
            }
        });

        return new Schedule({...schedule, activeDays : schedule.activeDays as number[], teams : schedule.teams?.map(team => new Team({...team})) ?? []});
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
                    select: TEAM_SELECT_CONFIG
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return schedules.map(schedule => this.mapPrismaToEntity(schedule));
    }
    // #endregion

    // #region Create
    /**
     * Crée un nouveau schedule
     */
    async createSchedule(schedule: Schedule): Promise<Schedule> {
        const cleanSchedule = this.cleanScheduleForPrisma(schedule);


        const createdSchedule = await this.prisma.schedule.create({
            data: {
                ...cleanSchedule
            },
        });

        return this.mapPrismaToEntity(createdSchedule);
    }
    // #endregion

    // #region Update
    /**
     * Met à jour un schedule
     */
    async updateSchedule_ById(schedule: Schedule): Promise<Schedule> {

        const { managerId, ...cleanSchedule } = this.cleanScheduleForPrisma(schedule);

        const updatedSchedule = await this.prisma.schedule.update({
            where: { id: schedule.id },
            data: {
                ...cleanSchedule,
                updatedAt: new Date()
            }
        });

        return this.mapPrismaToEntity(updatedSchedule);
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
    /**
     * Mappe un objet Prisma vers une entité Schedule
     */
    private mapPrismaToEntity<T extends PrismaSchedule & { teams?: ScheduleTeamSelect[] }>(prismaSchedule: T): Schedule {
        const activeDays = Array.isArray(prismaSchedule.activeDays)
            ? prismaSchedule.activeDays as number[]
            : [];

        return new Schedule({
            ...prismaSchedule,
            activeDays: activeDays,
            teams: prismaSchedule.teams?.map(team => new Team({ ...team })),
        });
    }

    private cleanScheduleForPrisma(schedule: Schedule) {
        const { users, usersCount, id, teams, createdAt, updatedAt, ...scheduleData } = schedule;
        return {
            ...scheduleData,
        };
    }
    // #endregion
}

import { ISchedule } from "@/domain/interfaces/schedule.interface";
import { Schedule } from "@/domain/entities/schedule";
import { ScheduleFilterDTO } from "@/application/DTOS";
import { prismaService } from "../prisma.service";
import { NotFoundError } from "@/domain/error/AppError";

export class ScheduleRepository implements ISchedule {
    private prisma = prismaService.getInstance();

    // #region Read
    /**
     * Récupère tous les schedules avec filtres optionnels
     */
    async getAllSchedules(filter?: ScheduleFilterDTO): Promise<Schedule[]> {
        const where: any = {};

        if (filter?.name) {
            where.name = {
                contains: filter.name,
                mode: 'insensitive'
            };
        }

        if (filter?.activeDays && filter.activeDays.length > 0) {
            // Recherche les schedules qui contiennent au moins un des jours spécifiés
            where.activeDays = {
                hasSome: filter.activeDays
            };
        }

        const schedules = await this.prisma.schedule.findMany({
            where,
            include: {
                users: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                },
                teams: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return schedules.map(schedule => this.mapPrismaToEntity(schedule));
    }

    /**
     * Récupère un schedule par son ID
     */
    async getSchedule_ById(id: number): Promise<Schedule | null> {
        const schedule = await this.prisma.schedule.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                },
                teams: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return schedule ? this.mapPrismaToEntity(schedule) : null;
    }

    /**
     * Récupère les schedules utilisés par un utilisateur spécifique
     */
    async getSchedules_ByUserId(userId: number): Promise<Schedule[]> {
        const schedules = await this.prisma.schedule.findMany({
            where: {
                users: {
                    some: {
                        id: userId
                    }
                }
            },
            include: {
                users: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return schedules.map(schedule => this.mapPrismaToEntity(schedule));
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
                    select: {
                        id: true,
                        name: true
                    }
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
        const createdSchedule = await this.prisma.schedule.create({
            data: {
                name: schedule.name,
                startHour: schedule.startHour,
                endHour: schedule.endHour,
                activeDays: schedule.activeDays
            },
            include: {
                users: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        return this.mapPrismaToEntity(createdSchedule);
    }
    // #endregion

    // #region Update
    /**
     * Met à jour un schedule
     */
    async updateSchedule_ById(schedule: Schedule): Promise<Schedule> {
        if (!schedule.id) {
            throw new Error("L'ID du schedule est requis pour la mise à jour");
        }

        const updatedSchedule = await this.prisma.schedule.update({
            where: { id: schedule.id },
            data: {
                name: schedule.name,
                startHour: schedule.startHour,
                endHour: schedule.endHour,
                activeDays: schedule.activeDays,
                updatedAt: new Date()
            },
            include: {
                users: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                }
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
        const isInUse = await this.isScheduleInUse(id);
        if (isInUse) {
            throw new Error("Impossible de supprimer ce schedule car il est utilisé par des utilisateurs ou des équipes");
        }

        await this.prisma.schedule.delete({
            where: { id }
        });
    }
    // #endregion

    // #region Business Methods
    /**
     * Vérifie si un schedule est utilisé par des utilisateurs ou équipes
     */
    async isScheduleInUse(id: number): Promise<boolean> {
        const [userCount, teamCount] = await Promise.all([
            this.prisma.user.count({
                where: { scheduleId: id }
            }),
            this.prisma.team.count({
                where: { scheduleId: id }
            })
        ]);

        return userCount > 0 || teamCount > 0;
    }

    /**
     * Récupère le nombre d'utilisateurs utilisant un schedule
     */
    async getScheduleUsersCount(id: number): Promise<number> {
        return await this.prisma.user.count({
            where: { scheduleId: id }
        });
    }
    // #endregion

    // #region Private Helper Methods
    /**
     * Mappe un objet Prisma vers une entité Schedule
     */
    private mapPrismaToEntity(prismaSchedule: any): Schedule {
        return new Schedule({
            id: prismaSchedule.id,
            name: prismaSchedule.name,
            startHour: prismaSchedule.startHour,
            endHour: prismaSchedule.endHour,
            activeDays: prismaSchedule.activeDays,
            createdAt: prismaSchedule.createdAt,
            updatedAt: prismaSchedule.updatedAt,
            users: prismaSchedule.users,
            usersCount: prismaSchedule.users?.length || 0
        });
    }
    // #endregion
}


import { ITeam } from "@/domain/interfaces/team.interface";
import { prisma } from "../prisma.service";
import { User, Schedule, Team } from "@/domain/entities/";
import { ValidationError } from "@/domain/error/AppError";
import { TeamFilterDTO } from "@/application/DTOS";
import { nullToUndefined } from "@/shared/utils/prisma.helpers";
import { Schedule as PrismaSchedule, Team as PrismaTeam, User as PrismaUser } from "@/generated/prisma";

export class TeamRepository implements ITeam {

    // #region Read
    async getAllTeams(filter?: TeamFilterDTO): Promise<Team[]> {
        const { managerId } = filter || {};

        const teams = await prisma.team.findMany({
            where: {
                ...(managerId && { managerId }) // Filtre uniquement si managerId est fourni
            },
            include: {
                _count: {
                    select: {
                        members: true
                    }
                },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                }
            }
        });

        return teams.map(team =>
            new Team({
                ...team,
                scheduleId: team.scheduleId ?? undefined,
                manager: new User({ ...team.manager })
            })
        );
    }

    async getTeam_ById(id: number): Promise<Team | null> {
        const team = await prisma.team.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        members: true
                    }
                },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                },
                members: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                        phone: true,
                        customScheduleId: true,
                    }
                },
                schedule: {
                    select: {
                        id: true,
                        name: true,
                        startHour: true,
                        endHour: true,
                        activeDays: true,
                        managerId: true,
                    }
                }
            }
        });

        if (!team) {
            return null;
        }

        return new Team({
            ...nullToUndefined(team),
            manager: new User({ ...team.manager }),
            members: team.members.map(membre => new User({ ...membre, customSchedule: membre.customScheduleId ? {id : membre.customScheduleId} : undefined })),
            schedule:team.schedule ? new Schedule({ ...team.schedule }) : undefined
        });
    }

    async getTeams_ByManagerId(managerId: number): Promise<Team[]> {
        const teams = await prisma.team.findMany({
            where: {
                managerId
            },
            include: {
                _count: {
                    select: {
                        members: true
                    }
                },
                manager: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                }
            }
        })
        return teams.map(team => new Team({
            ...nullToUndefined(team),
            manager: new User({ ...team.manager })
        }));
    }
    // #endregion

    // #region Create
    async createTeam(team: Team): Promise<Team> {
        const teamCreated = await prisma.team.create({
            data: {
                name: team.name,
                description: team.description,
                managerId: team.managerId,
                scheduleId: team.scheduleId,
            },
            include: {
                _count: {
                    select: {
                        members: true
                    }
                },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                }
            }
        });

        return new Team({...nullToUndefined(teamCreated),
            manager: new User({ ...teamCreated.manager })
        });
    }
    // #endregion

    // #region Update
    async updateTeam_ById(team: Team): Promise<Team> {
        if (!team.id) {
            throw new ValidationError("L'équipe doit avoir un ID pour être mise à jour");
        }

        const teamUpdated = await prisma.team.update({
            where: { id: team.id },
            data: {
                name: team.name,
                description: team.description,
                scheduleId: team.scheduleId,
                updatedAt: new Date(),
            },
            include: {
                _count: {
                    select: {
                        members: true
                    }
                },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                }
            }
        });

        return new Team({
            ...nullToUndefined(teamUpdated),
            manager: new User({ ...teamUpdated.manager })
        });
    }
    // #endregion

    // #region Delete
    async deleteTeam_ById(id: number): Promise<Team> {
        const teamDeleted = await prisma.team.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
            include: {
                _count: {
                    select: {
                        members: true
                    }
                },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                }
            }
        });

        return new Team({
            ...nullToUndefined(teamDeleted),
            manager: new User({ ...teamDeleted.manager })
        });
    }
    // #endregion

        // #region Private Helper Methods

    
        // #endregion

}


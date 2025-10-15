import { ITeam } from "@/domain/interfaces/team.interface";
import { Team } from "@/domain/entities/team";
import { prisma } from "../prisma.service";
import { User } from "@/domain/entities/user";
import { ValidationError } from "@/domain/error/AppError";
import { TeamFilterDTO } from "@/application/DTOS";

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
                        scheduleId: true,
                    }
                }
            }
        });

        if (!team) {
            return null;
        }

        return new Team({
            ...team,
            scheduleId: team.scheduleId ?? undefined,
            manager: new User({ ...team.manager }),
            members: team.members.map(membre => new User({ ...membre, scheduleId: membre.scheduleId ?? undefined }))
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
            ...team,
            scheduleId: team.scheduleId ?? undefined,
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

        return new Team({
            ...teamCreated,
            scheduleId: teamCreated.scheduleId ?? undefined,
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
            ...teamUpdated,
            scheduleId: teamUpdated.scheduleId ?? undefined,
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
            ...teamDeleted,
            scheduleId: teamDeleted.scheduleId ?? undefined,
            manager: new User({ ...teamDeleted.manager })
        });
    }
    // #endregion
}


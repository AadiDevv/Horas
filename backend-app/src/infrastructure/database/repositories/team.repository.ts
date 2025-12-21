import { ITeam } from "@/domain/interfaces/team.interface";
import { prisma } from "../prisma.service";
import { User, Schedule, Team, Team_Core, Schedule_Core, UserEmployee_Core, UserManager_Core, Team_L1 } from "@/domain/entities/";
import { ValidationError } from "@/domain/error/AppError";
import { TeamFilterDTO } from "@/application/DTOS";
import { nullToUndefined } from "@/shared/utils/prisma.helpers";
import { Schedule as PrismaSchedule, Team as PrismaTeam, User as PrismaUser } from "@prisma/client";
import { SCHEDULE_CORE_SELECT, TEAM_CORE_SELECT, TEAM_L1_SELECT, USER_EMPLOYEE_CORE_SELECT, USER_MANAGER_CORE_SELECT } from "@/infrastructure/prismaUtils/selectConfigs";

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
                        ...USER_MANAGER_CORE_SELECT,
                    }
                },
                schedule: {
                    select: {
                        ...SCHEDULE_CORE_SELECT,
                    }
                },
                members: {
                    select: {
                        ...USER_EMPLOYEE_CORE_SELECT,
                    }
                }
            }
        });

        return teams.map(team =>
            new Team({
                ...team,
                schedule: team.schedule ? new Schedule_Core({ ...team.schedule, activeDays: team.schedule.activeDays as number[] }) : null,
                manager: new UserManager_Core({ ...team.manager }),
                members: team.members.map(member => new UserEmployee_Core({ ...member, managerId: member.managerId!, customScheduleId: null })),
                membersCount: team._count.members,
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
                        ...USER_MANAGER_CORE_SELECT
                    }
                },
                members: {
                    select: {
                        ...USER_EMPLOYEE_CORE_SELECT
                    }
                },
                schedule: {
                    select: {
                        ...SCHEDULE_CORE_SELECT
                    }
                }
            }
        });

        if (!team) {
            return null;
        }

        return new Team({
            ...team,
            schedule: team.schedule ? new Schedule_Core({ ...team.schedule, activeDays: team.schedule.activeDays as number[] }) : null,
            manager: new UserManager_Core({ ...team.manager }),
            members: team.members.map(member => new UserEmployee_Core({ ...member, managerId: member.managerId!, customScheduleId: null })),
            membersCount: team._count.members,
        })
    }

    async getTeams_ByManagerId(managerId: number): Promise<Team_L1[]> {
        const teams = await prisma.team.findMany({
            where: {
                managerId
            },
            select: {
                ...TEAM_L1_SELECT,
            }
        })
        return teams.map(team => new Team_L1({
            ...team,
            membersCount: team._count.members,
        }));
    }
    // #endregion

    // #region Create
    async createTeam(team: Team_Core): Promise<Team_Core> {
        const { id, membersCount, ...rest } = team;
        const teamCreated = await prisma.team.create({
            data: {
                ...nullToUndefined(rest),
            },

            select: {
                ...TEAM_CORE_SELECT,
            }
        });

        return new Team_Core({
            ...teamCreated,
            membersCount: teamCreated._count.members,
        });
    }

    async updateTeamSchedule_ById(teamId: number, scheduleId: number): Promise<Team_Core> {
        const teamUpdated = await prisma.team.update({
            where: { id: teamId },
            data: {
                scheduleId: scheduleId,
            },
            select:{
                ...TEAM_CORE_SELECT
            }
        });
        return new Team_Core({
            ...teamUpdated,
            membersCount: teamUpdated._count.members,
        });
    }
    // #endregion

    // #region Update
    async updateTeam_ById(team: Team_Core): Promise<Team_Core> {
        if (!team.id) {
            throw new ValidationError("L'équipe doit avoir un ID pour être mise à jour");
        }

        const { id, membersCount, ...rest } = team;
        const teamUpdated = await prisma.team.update({
            where: { id: team.id },
            data: {
                ...nullToUndefined(rest),
            },
            include: {
                _count: {
                    select: {
                        members: true
                    }
                },
            }
        });

        return new Team_Core({
            ...teamUpdated,
            membersCount: teamUpdated._count.members,
        });
    }
    // #endregion

    // #region Delete
    async deleteTeam_ById(id: number): Promise<Team_Core> {
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
            }
        });

        return new Team_Core({
            ...teamDeleted,
            membersCount: teamDeleted._count.members,
        });
    }
    // #endregion

        // #region Private Helper Methods

    
        // #endregion

}


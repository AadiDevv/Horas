import { IAbsence } from "@/domain/interfaces/absence.interface";
import { Absence, Absence_Core, Absence_L1 } from "@/domain/entities/absence";
import { prisma } from "../prisma.service";
import { UserEmployee_Core, UserManager_Core } from "@/domain/entities/user";
import { ABSENCE_CORE_SELECT, ABSENCE_L1_SELECT } from "@/infrastructure/prismaUtils/selectConfigs/absence.prismaConfig";
import { USER_EMPLOYEE_CORE_SELECT, USER_MANAGER_CORE_SELECT } from "@/infrastructure/prismaUtils/selectConfigs/user.prismaConfig";

export class AbsenceRepository implements IAbsence {

    // #region Read

    async getAllAbsences(filter?: {
        employeId?: number;
        status?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<Absence_Core[]> {
        const { employeId, status, type, startDate, endDate } = filter || {};

        const dateFilter: { gte?: Date; lte?: Date } = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        const absences = await prisma.absence.findMany({
            where: {
                deletedAt: null,
                ...(employeId && { employeId }),
                ...(status && { status: status as any }),
                ...(type && { type: type as any }),
                ...(Object.keys(dateFilter).length && { startDateTime: dateFilter }),
            },
            select: {
                ...ABSENCE_CORE_SELECT,
            },
            orderBy: {
                startDateTime: 'desc'
            }
        });

        return absences.map(e => new Absence_Core({ ...e }));
    }

    async getAbsence_ById(id: number): Promise<Absence | null> {
        const absence = await prisma.absence.findUnique({
            where: { id, deletedAt: null },
            select: {
                ...ABSENCE_L1_SELECT,
                employe: {
                    select: {
                        ...USER_EMPLOYEE_CORE_SELECT,
                    }
                },
                validator: {
                    select: {
                        ...USER_MANAGER_CORE_SELECT,
                    }
                }
            },
        });

        if (!absence) return null;

        return new Absence({
            ...absence,
            employe: new UserEmployee_Core({
                ...absence.employe,
                managerId: absence.employe.managerId!,
                customScheduleId: null
            }),
            validator: absence.validator ? new UserManager_Core({
                ...absence.validator
            }) : null
        });
    }

    async getAbsences_ByEmployeId(employeId: number): Promise<Absence[]> {
        const absences = await prisma.absence.findMany({
            where: { employeId, deletedAt: null },
            select: {
                ...ABSENCE_L1_SELECT,
                employe: {
                    select: {
                        ...USER_EMPLOYEE_CORE_SELECT,
                    }
                },
                validator: {
                    select: {
                        ...USER_MANAGER_CORE_SELECT,
                    }
                }
            },
            orderBy: {
                startDateTime: "desc"
            }
        });

        return absences.map(e => new Absence({
            ...e,
            employe: new UserEmployee_Core({
                ...e.employe,
                managerId: e.employe.managerId!,
                customScheduleId: null
            }),
            validator: e.validator ? new UserManager_Core({
                ...e.validator
            }) : null
        }));
    }

    async getPendingAbsences_ByManagerId(managerId: number): Promise<Absence[]> {
        const absences = await prisma.absence.findMany({
            where: {
                deletedAt: null,
                status: 'en_attente',
                employe: {
                    managerId: managerId
                }
            },
            select: {
                ...ABSENCE_L1_SELECT,
                employe: {
                    select: {
                        ...USER_EMPLOYEE_CORE_SELECT,
                    }
                },
                validator: {
                    select: {
                        ...USER_MANAGER_CORE_SELECT,
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return absences.map(e => new Absence({
            ...e,
            employe: new UserEmployee_Core({
                ...e.employe,
                managerId: e.employe.managerId!,
                customScheduleId: null
            }),
            validator: e.validator ? new UserManager_Core({
                ...e.validator
            }) : null
        }));
    }

    // #endregion

    // #region Create

    async createAbsence(absence: Absence_Core): Promise<Absence_Core> {
        const { id, ...absenceData } = absence;

        const createdAbsence = await prisma.absence.create({
            data: { ...absenceData },
            select: {
                ...ABSENCE_CORE_SELECT,
            }
        });

        return new Absence_Core({ ...createdAbsence });
    }

    // #endregion

    // #region Update

    async updateAbsence_ById(absence: Absence_L1): Promise<Absence_L1> {
        const { createdAt, deletedAt, ...updateData } = absence;

        const updatedAbsence = await prisma.absence.update({
            where: { id: absence.id },
            data: {
                ...updateData,
                updatedAt: new Date()
            },
            select: {
                ...ABSENCE_L1_SELECT,
            }
        });

        return new Absence_L1({ ...updatedAbsence });
    }

    async validateAbsence(
        id: number,
        validatedBy: number,
        status: 'approuve' | 'refuse',
        comments?: string
    ): Promise<Absence_L1> {
        const updatedAbsence = await prisma.absence.update({
            where: { id },
            data: {
                status,
                validatedBy,
                validatedAt: new Date(),
                comments: comments || null,
                updatedAt: new Date()
            },
            select: {
                ...ABSENCE_L1_SELECT,
            }
        });

        return new Absence_L1({ ...updatedAbsence });
    }

    // #endregion

    // #region Delete

    async deleteAbsence_ById(id: number): Promise<void> {
        await prisma.absence.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        });
    }

    // #endregion
}

import { IException } from "@/domain/interfaces/exception.interface";
import { Exception, Exception_Core, Exception_L1 } from "@/domain/entities/exception";
import { prisma } from "../prisma.service";
import { UserEmployee_Core, UserManager_Core } from "@/domain/entities/user";
import { EXCEPTION_CORE_SELECT, EXCEPTION_L1_SELECT } from "@/infrastructure/prismaUtils/selectConfigs/exception.prismaConfig";
import { USER_EMPLOYEE_CORE_SELECT, USER_MANAGER_CORE_SELECT } from "@/infrastructure/prismaUtils/selectConfigs/user.prismaConfig";

export class ExceptionRepository implements IException {

    // #region Read

    async getAllExceptions(filter?: {
        employeId?: number;
        status?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<Exception_Core[]> {
        const { employeId, status, type, startDate, endDate } = filter || {};

        const dateFilter: { gte?: Date; lte?: Date } = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        const exceptions = await prisma.exception.findMany({
            where: {
                deletedAt: null,
                ...(employeId && { employeId }),
                ...(status && { status: status as any }),
                ...(type && { type: type as any }),
                ...(Object.keys(dateFilter).length && { startDateTime: dateFilter }),
            },
            select: {
                ...EXCEPTION_CORE_SELECT,
            },
            orderBy: {
                startDateTime: 'desc'
            }
        });

        return exceptions.map(e => new Exception_Core({ ...e }));
    }

    async getException_ById(id: number): Promise<Exception | null> {
        const exception = await prisma.exception.findUnique({
            where: { id, deletedAt: null },
            select: {
                ...EXCEPTION_L1_SELECT,
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

        if (!exception) return null;

        return new Exception({
            ...exception,
            employe: new UserEmployee_Core({
                ...exception.employe,
                managerId: exception.employe.managerId!,
                customScheduleId: null
            }),
            validator: exception.validator ? new UserManager_Core({
                ...exception.validator
            }) : null
        });
    }

    async getExceptions_ByEmployeId(employeId: number): Promise<Exception[]> {
        const exceptions = await prisma.exception.findMany({
            where: { employeId, deletedAt: null },
            select: {
                ...EXCEPTION_L1_SELECT,
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

        return exceptions.map(e => new Exception({
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

    async getPendingExceptions_ByManagerId(managerId: number): Promise<Exception[]> {
        const exceptions = await prisma.exception.findMany({
            where: {
                deletedAt: null,
                status: 'en_attente',
                employe: {
                    managerId: managerId
                }
            },
            select: {
                ...EXCEPTION_L1_SELECT,
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

        return exceptions.map(e => new Exception({
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

    async createException(exception: Exception_Core): Promise<Exception_Core> {
        const { id, ...exceptionData } = exception;

        const createdException = await prisma.exception.create({
            data: { ...exceptionData },
            select: {
                ...EXCEPTION_CORE_SELECT,
            }
        });

        return new Exception_Core({ ...createdException });
    }

    // #endregion

    // #region Update

    async updateException_ById(exception: Exception_L1): Promise<Exception_L1> {
        const { createdAt, deletedAt, ...updateData } = exception;

        const updatedException = await prisma.exception.update({
            where: { id: exception.id },
            data: {
                ...updateData,
                updatedAt: new Date()
            },
            select: {
                ...EXCEPTION_L1_SELECT,
            }
        });

        return new Exception_L1({ ...updatedException });
    }

    async validateException(
        id: number,
        validatedBy: number,
        status: 'approuve' | 'refuse',
        comments?: string
    ): Promise<Exception_L1> {
        const updatedException = await prisma.exception.update({
            where: { id },
            data: {
                status,
                validatedBy,
                validatedAt: new Date(),
                comments: comments || null,
                updatedAt: new Date()
            },
            select: {
                ...EXCEPTION_L1_SELECT,
            }
        });

        return new Exception_L1({ ...updatedException });
    }

    // #endregion

    // #region Delete

    async deleteException_ById(id: number): Promise<void> {
        await prisma.exception.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        });
    }

    // #endregion
}

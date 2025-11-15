import { ITimesheet } from "@/domain/interfaces/timesheet.interface";
import { Timesheet, Timesheet_Core } from "@/domain/entities/timesheet";
import { prisma } from "../prisma.service";
import { User } from "@/domain/entities/user";
import { TimesheetFilterDTO } from "@/application/DTOS";
import { TIMESHEET_CORE_SELECT, TIMESHEET_L1_SELECT } from "@/infrastructure/prismaUtils/timesheets.prismaConfig";
import { USER_CORE_SELECT } from "@/infrastructure/prismaUtils/user.prismaConfig";


export class TimesheetRepository implements ITimesheet {

    // #region Read

    async getAllTimesheets(filter?: TimesheetFilterDTO): Promise<Timesheet[]> {
        const { employeId, startDate, endDate, status, clockin } = filter || {};

        const dateFilter: any = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        const timesheets = await prisma.timesheet.findMany({
            where: {
                ...(employeId && { employeId }),
                ...(Object.keys(dateFilter).length && { date: dateFilter }),
                ...(status && { status }),
                ...(clockin !== undefined && { clockin }),
            },
            select: {
                ...TIMESHEET_CORE_SELECT,
                employe: {
                    select: {
                        ...USER_CORE_SELECT,
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        return timesheets.map(t => new Timesheet({
            ...t,
            employe: new User({ ...t.employe })
        }));
    }

    async getTimesheetById(id: number): Promise<Timesheet | null> {
        const timesheet = await prisma.timesheet.findUnique({
            where: { id },
            include: {
                employe: {
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

        if (!timesheet) return null;

        return new Timesheet({
            ...timesheet,
            employe: new User({ ...timesheet.employe })
        });
    }

    async getTimesheets_ByEmployeId(employeId: number): Promise<Timesheet[]> {
        const timesheets = await prisma.timesheet.findMany({
            where: { employeId },
            include: {
                employe: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                }
            },
            orderBy: {
                date: "desc"
            }
        });

        return timesheets.map(t => new Timesheet({
            ...t,
            employe: new User({ ...t.employe })
        }));
    }

    async getLastByEmployee(employeId: number): Promise<Timesheet | null> {
        const timesheet = await prisma.timesheet.findFirst({
            where: { employeId },
            include: {
                employe: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                }
            },
            orderBy: [
                { date: 'desc' },
                { hour: 'desc' },
            ],
        });

        if (!timesheet) return null;

        return new Timesheet({
            ...timesheet,
            employe: new User({ ...timesheet.employe }),
        });
    }

    async getTimesheetStats(employeId: number, startDate: string, endDate: string) {
        const periodStart = new Date(startDate);
        const periodEnd = new Date(endDate);

        const timesheets = await prisma.timesheet.findMany({
            where: {
                employeId,
                date: {
                    gte: periodStart,
                    lte: periodEnd
                }
            }
        });

        const stats = {
            employeId,
            periodStart: startDate,
            periodEnd: endDate,
            totalTimesheets: timesheets.length,
            totalClockins: timesheets.filter(t => t.clockin).length,
            totalClockouts: timesheets.filter(t => !t.clockin).length,
            timesheetsNormal: timesheets.filter(t => t.status === "normal").length,
            timesheetsDelay: timesheets.filter(t => t.status === "delay").length,
            timesheetsIncomplete: timesheets.filter(t => t.status === "incomplete").length,
            clockedDays: new Set(timesheets.map(t => t.date.toDateString())).size,
        };

        return stats;
    }

    // #endregion

    // #region Create

    async createTimesheet(timesheet: Timesheet_Core): Promise<Timesheet> {
        const created = await prisma.timesheet.create({
            data: {
                employeId: timesheet.employeId,
                date: timesheet.date,
                hour: timesheet.hour,
                clockin: timesheet.clockin,
                status: timesheet.status,
            },
            include: {
                employe: {
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

        return new Timesheet({
            ...created,
            employe: new User({ ...created.employe })
        });
    }

    // #endregion

    // #region Update

    async updateTimesheet_ById(timesheet: Timesheet): Promise<Timesheet> {
        const updated = await prisma.timesheet.update({
            where: { id: timesheet.id },
            data: {
                date: timesheet.date,
                hour: timesheet.hour,
                clockin: timesheet.clockin,
                status: timesheet.status,
                updatedAt: new Date()
            },
            include: {
                employe: {
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

        return new Timesheet({
            ...updated,
            employe: new User({ ...updated.employe })
        });
    }

    // #endregion

    // #region Delete

    async deleteTimesheet_ById(id: number): Promise<void> {
        await prisma.timesheet.delete({
            where: { id }
        });
    }

    // #endregion
}

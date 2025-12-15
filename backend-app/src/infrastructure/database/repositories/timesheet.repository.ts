import { ITimesheet } from "@/domain/interfaces/timesheet.interface";
import { Timesheet } from "@/domain/entities/timesheet";
import { prisma } from "../prisma.service";
import { User } from "@/domain/entities/user";
import { ValidationError } from "@/domain/error/AppError";
import { TimesheetFilterDTO } from "@/application/DTOS";
import { TimesheetStatus } from "@prisma/client";

export class TimesheetRepository implements ITimesheet {

    // #region Read

    async getAllTimesheets(filter?: TimesheetFilterDTO): Promise<Timesheet[]> {
        const { employeId, startDate, endDate, status, clockin } = filter || {};

        const timestampFilter: any = {};
        if (startDate) timestampFilter.gte = new Date(startDate);
        if (endDate) timestampFilter.lte = new Date(endDate);

        const timesheets = await prisma.timesheet.findMany({
            where: {
                ...(employeId && { employeId }),
                ...(Object.keys(timestampFilter).length && { timestamp: timestampFilter }),
                ...(status && { status }),
                ...(clockin !== undefined && { clockin }),
            },
            include: {
                employe: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                timestamp: 'desc'
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
                    }
                }
            },
            orderBy: {
                timestamp: "desc"
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
                    }
                }
            },
            orderBy: {
                timestamp: 'desc'
            },
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
                timestamp: {
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
            clockedDays: new Set(timesheets.map(t => t.timestamp.toDateString())).size,
        };

        return stats;
    }

    // #endregion

    // #region Create

    async createTimesheet(timesheet: Timesheet): Promise<Timesheet> {
        const created = await prisma.timesheet.create({
            data: {
                employeId: timesheet.employeId,
                timestamp: timesheet.timestamp,
                clockin: timesheet.clockin,
                status: timesheet.status ?? "normal",
            },
            include: {
                employe: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
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
        if (!timesheet.id) {
            throw new ValidationError("Le timesheet doit avoir un ID pour être mis à jour");
        }

        const updated = await prisma.timesheet.update({
            where: { id: timesheet.id },
            data: {
                timestamp: timesheet.timestamp,
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
                        email: true
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

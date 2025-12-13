import { ITimesheet } from "@/domain/interfaces/timesheet.interface";
import { Timesheet, Timesheet_Core, Timesheet_L1 } from "@/domain/entities/timesheet";
import { prisma } from "../prisma.service";
import { UserEmployee_Core } from "@/domain/entities/user";
import { TimesheetFilterDTO } from "@/application/DTOS";
import { TIMESHEET_CORE_SELECT, TIMESHEET_L1_SELECT } from "@/infrastructure/prismaUtils/selectConfigs/timesheets.prismaConfig";
import { USER_EMPLOYEE_CORE_SELECT } from "@/infrastructure/prismaUtils/selectConfigs/user.prismaConfig";


export class TimesheetRepository implements ITimesheet {

    // #region Read

    async getAllTimesheets(filter?: TimesheetFilterDTO): Promise<Timesheet_Core[]> {
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
            select: {
                ...TIMESHEET_CORE_SELECT, 
            },
            orderBy: {
                timestamp: 'desc'
            }
        });

        return timesheets.map(t => new Timesheet_Core({
            ...t,
        }));
    }

    async getTimesheetById(id: number): Promise<Timesheet | null> {
        const timesheet = await prisma.timesheet.findUnique({
            where: { id },
            select: {
                ...TIMESHEET_L1_SELECT,
                employe: {
                    select: {
                        ...USER_EMPLOYEE_CORE_SELECT,
                    }
                }
            },
        });

        if (!timesheet) return null;

        return new Timesheet({
            ...timesheet,
            employe: new UserEmployee_Core({ ...timesheet.employe, managerId: timesheet.employe.managerId!, customScheduleId: null })
        });
    }

    async getTimesheets_ByEmployeId(employeId: number): Promise<Timesheet[]> {
        const timesheets = await prisma.timesheet.findMany({
            where: { employeId },
            select: {
                ...TIMESHEET_L1_SELECT,
                employe: {
                    select: {
                        ...USER_EMPLOYEE_CORE_SELECT,
                    }
                }
            },
            orderBy: {
                timestamp: "desc"
            }
        });

        return timesheets.map(t => new Timesheet({
            ...t,
            employe: new UserEmployee_Core({ ...t.employe, managerId: t.employe.managerId!, customScheduleId: null })
        }));
    }

    async getLastByEmployee(employeId: number): Promise<Timesheet | null> {
        const timesheet = await prisma.timesheet.findFirst({
            where: { employeId },
            select: {
                ...TIMESHEET_L1_SELECT,
                employe: {
                    select: {
                        ...USER_EMPLOYEE_CORE_SELECT,
                    }
                }
            },
            orderBy: {
                timestamp: 'desc',
            },
        });

        if (!timesheet) return null;

        return new Timesheet({
            ...timesheet,
            employe: new UserEmployee_Core({ ...timesheet.employe, managerId: timesheet.employe.managerId!, customScheduleId: null })
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

    async createTimesheet(timesheet: Timesheet_Core): Promise<Timesheet_Core> {
        const { id, ...rest } = timesheet;
        const created = await prisma.timesheet.create({
            data: {
                ...rest,
            },
            select: {
                ...TIMESHEET_CORE_SELECT,
            }
        });

        return new Timesheet_Core({
            ...created,
        });
    }

    // #endregion

    // #region Update

    async updateTimesheet_ById(timesheet: Timesheet_L1): Promise<Timesheet_L1> {
        const updated = await prisma.timesheet.update({
            where: { id: timesheet.id },
            data: {
                ...timesheet,
                updatedAt: new Date()
            },
            select: {
                ...TIMESHEET_L1_SELECT,
            }
        });

        return new Timesheet_L1({
            ...updated,
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

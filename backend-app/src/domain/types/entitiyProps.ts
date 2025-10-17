import { Role } from "./valueType";
import { User } from "../entities/user";
export type UserProps = {
    email: string,
    hashedPassword?: string,
    firstName: string,
    lastName: string,
    role: Role,
    isActive: boolean,

    createdAt?: Date,
    updatedAt?: Date,
    lastLoginAt?: Date,
    deletedAt?: Date,

    phone?: string,
    id?: number,
    team?: {
        id: number;
        name?: string;
    };

    schedule?: {
        id: number;
        name?: string;
        startHour?: Date;
        endHour?: Date;
    };
}

export type TeamProps = {
    id?: number,
    name: string,
    description?: string,
    managerId: number,
    scheduleId?: number,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date | null,
    manager?: User,
    members?: User[],
    membersCount?: number,
}
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
    teamId?: number,
    scheduleId?: number,
    id?: number,
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
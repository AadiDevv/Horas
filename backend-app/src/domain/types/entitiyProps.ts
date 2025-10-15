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

    telephone?: string,
    equipeId?: number,
    plageHoraireId?: number,
    id?: number,
}

export type EquipeProps = {
    id?: number,
    lastName: string,
    description?: string,
    managerId: number,
    plageHoraireId?: number,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date | null,
    manager?: User,
    membres?: User[],
    membresCount?: number,
}
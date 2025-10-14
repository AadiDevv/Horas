import { Role } from "./valueType";
import { User } from "../entities/user";
export type UserProps = {
    email: string,
    hashedPassword: string,
    prenom: string,
    nom: string,
    role: Role,
    isActive: boolean,

    createdAt?: Date,
    updatedAt?: Date,
    lastLoginAt?: Date,
    deletedAt?: Date,

    telephone?: string,
    equipeId?: number,
    horaireId?: number,
    id?: number,
}

export type EquipeProps = {
    id?: number,
    nom: string,
    description?: string,
    managerId: number,
    horaireId?: number,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date,
    manager?: User,
    membres?: User[],
    membresCount?: number,
}
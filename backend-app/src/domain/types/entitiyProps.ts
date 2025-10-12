import { Role } from "./valueType";
export type UserProps = {
    email: string,
    hashedPassword: string,
    prenom: string,
    nom: string,
    role: Role,
    isActive: boolean,

    createdAt?: Date,
    updatedAt?: Date,
    lastLoginAt?: Date | null,
    deletedAt?: Date | null,

    telephone?: string | null,
    equipeId?: number | null,
    plageHoraireId?: number | null,
    id?: number,
}
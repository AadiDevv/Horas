export type UserProps = {
    email: string,
    hashedPassword: string,
    username: string,
    isActive: boolean,
    isAdmin: boolean,

    createdAt?: Date,
    updatedAt?: Date,
    lastLoginAt?: Date,

    phone?: string,
    address?: string,
    id?: string,
}
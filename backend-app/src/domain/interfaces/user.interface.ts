import {  UserEmployee, UserEmployee_Core, UserManager, User_Core, User_L1 } from "@/domain/entities/user";

/**
 * Interface du repository User
 * Définit le contrat pour les opérations CRUD sur les utilisateurs
 * 
 * Note : Les opérations d'authentification (register/login) restent dans IAuth
 */
export interface IUser {
    
    getEmployee_ById(id: number): Promise<UserEmployee>;

    getUser_ById(id: number): Promise<User_Core>;

    getUserL1_ByEmail(email: string): Promise<User_L1 | null>;

    getManager_ById(id: number): Promise<UserManager>;

    getEmployees_ByManagerId(managerId: number): Promise<UserEmployee_Core[]>;

    updateUserProfile_ById(user: User_Core): Promise<User_Core>;

    updateUserTeam_ById(userId: number, teamId: number): Promise<UserEmployee_Core>;

    updateUserCustomSchedule_ById(userId: number, scheduleId: number | null): Promise<UserEmployee_Core>;

    deleteUser_ById(id: number): Promise<User_L1>;
}


import { User, UserEmployee_Core, UserEmployee_L1, UserManager_Core } from "@/domain/entities/user";

/**
 * Interface pour les opérations d'authentification
 * Contient uniquement les méthodes nécessaires pour register/login
 * 
 * Note : Les opérations CRUD sur les utilisateurs sont dans IUser
 */
export interface IAuth {
  // #region Read (pour authentification uniquement)
  getEmployee_ByEmail(email: string): Promise<User | null>;
  // #endregion

  // #region Update (pour auth)
  updateEmployeeLogin_byId(user: UserEmployee_L1): Promise<UserEmployee_L1>;
  // #endregion

  // #region Auth
  registerEmployee(user: UserEmployee_Core): Promise<UserEmployee_Core>;
  registerManager(user: UserManager_Core): Promise<UserManager_Core>;
  // #endregion
}   
import { UserEmployee_Core, UserEmployee_L1, UserManager_Core, User_Core, User_L1 } from "@/domain/entities/user";

/**
 * Interface pour les opérations d'authentification
 * Contient uniquement les méthodes nécessaires pour register/login
 * 
 * Note : Les opérations CRUD sur les utilisateurs sont dans IUser
 */
export interface IAuth {
  // #region Read (pour authentification uniquement)
  // getUser_ByEmail(email: string): Promise<User_L1 | null>;
  // #endregion

  // #region Update (pour auth)
  updateUserLogin_byId(user: User_L1): Promise<User_L1>;
  // #endregion

  // #region Auth
  registerEmployee(user: UserEmployee_Core): Promise<UserEmployee_Core>;
  registerManager(user: UserManager_Core): Promise<UserManager_Core>;
  // #endregion
}   
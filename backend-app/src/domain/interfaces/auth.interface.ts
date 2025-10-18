import { User } from "@/domain/entities/user";

/**
 * Interface pour les opérations d'authentification
 * Contient uniquement les méthodes nécessaires pour register/login
 * 
 * Note : Les opérations CRUD sur les utilisateurs sont dans IUser
 */
export interface IAuth {
  // #region Read (pour authentification uniquement)
  getUser_ByEmail(email: string): Promise<User | null>;
  // #endregion

  // #region Update (pour auth)
  updateUserLogin_byId(user: User): Promise<User>;
  // #endregion

  // #region Auth
  registerUser(user: User): Promise<User>;
  // #endregion
}   
import { User } from "@/domain/entities/user";

export interface IAuth {
  // #region Read
  getAllUsers(): Promise<User[]>;
  getUser_ById(id: number): Promise<User | null>;
  getUser_ByEmail(email: string): Promise<User | null>;
  // #endregion
  // #region Update
  updateUser_byId(user: User): Promise<User>;
  updateUserLogin_byId(user: User): Promise<User>;
  // #endregion
  // #region Delete
  deleteUser_ById(user: User): Promise<User>;
  // #endregion
  // #region Auth
  registerUser(user: User): Promise<User>;
  // #endregion
}   
import { Request, Response } from 'express';
import { UserUseCase } from '@/application/usecases';
import { UserUpdateDTO, UserFilterDTO } from '@/application/DTOS/user.dto';
import { ValidationError } from '@/domain/error/AppError';

/**
 * Contrôleur pour la gestion des utilisateurs (CRUD)
 * Gère les requêtes HTTP et appelle les use cases appropriés
 * 
 * Note: Les transformations Entité ↔ DTO sont gérées par l'entité User elle-même
 */
export class UserController {
  constructor(private UC_user: UserUseCase) { }

  // #region Read
  /**
   * GET /api/users?role=X&teamId=Y&isActive=true&search=...
   * Récupère la liste de tous les utilisateurs avec filtres optionnels
   * Admin uniquement
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    const filter: UserFilterDTO = {
      role: req.query.role as any,
      teamId: req.query.teamId ? Number(req.query.teamId) : undefined,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      search: req.query.search as string
    };

    const users = await this.UC_user.getAllUsers(filter);
    const usersDTO = users.map(user => user.toListItemDTO());

    res.success(usersDTO, "Liste des utilisateurs récupérée avec succès");
  }

  /**
   * GET /api/users/:id
   * Récupère un utilisateur par son ID
   */
  async getUser_ById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ValidationError("ID invalide");

    const user = await this.UC_user.getUser_ById(id);
    const userDTO = user.toReadDTO();

    res.success(userDTO, "Utilisateur récupéré avec succès");
  }

  /**
   * GET /api/users/my-employees
   * Récupère tous les employés du manager connecté
   * Manager + Admin
   */
  async getMyEmployees(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Pour les managers : managerId = leur propre ID
    // Pour les admins : managerId peut être spécifié en query param
    let managerId = userId;

    if (userRole === "admin" && req.query.managerId) {
      managerId = Number(req.query.managerId);
      if (isNaN(managerId)) {
        throw new ValidationError("managerId invalide");
      }
    }

    const employees = await this.UC_user.getMyEmployees(managerId, userId, userRole);
    const employeesDTO = employees.map(employee => employee.toListItemDTO());

    res.success(employeesDTO, "Liste des employés récupérée avec succès");
  }
  // #endregion

  // #region Update
  /**
   * PATCH /api/users/:id
   * Met à jour un utilisateur
   * - Admin : peut modifier n'importe quel utilisateur
   * - Manager/Employee : peut uniquement modifier son propre profil
   * 
   * Note : Les permissions sont vérifiées par le middleware adminOrSelf
   */
  async updateUser_ById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ValidationError("ID invalide");

    const userDto: UserUpdateDTO = req.body;
    if (!userDto || Object.keys(userDto).length === 0) {
      throw new ValidationError("Aucune donnée à mettre à jour");
    }

    const user = await this.UC_user.updateUser_ById(id, userDto);
    const userDTO = user.toReadDTO();

    res.success(userDTO, "Utilisateur modifié avec succès");
  }
  // #endregion

  // #region Delete
  /**
   * DELETE /api/users/:id
   * Supprime logiquement un utilisateur (soft delete)
   * Admin uniquement
   */
  async deleteUser_ById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ValidationError("ID invalide");

    await this.UC_user.deleteUser_ById(id);

    res.success(null, "Utilisateur supprimé avec succès");
  }
  // #endregion
}

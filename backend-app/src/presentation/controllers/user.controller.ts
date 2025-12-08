import { Request, Response } from 'express';
import { UserUseCase } from '@/application/usecases';
import { UserUpdateDTO, UserFilterDTO, UserAsignTeamDTO, UserAuthDTO, UserReadEmployeeDTO_Core } from '@/application/DTOS/';
import { ValidationError } from '@/domain/error/AppError';
import { UserMapper } from '@/application/mappers/user';
import { UserEmployee_Core } from '@/domain/entities/user';

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
   * GET /api/users/:id
   * Récupère un utilisateur par son ID
   */
  async getEmployee_ById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ValidationError("ID invalide");

    const user = await this.UC_user.getEmployee_ById(id);
    const userDTO = UserMapper.FromEntity.toReadDTO(user);

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

    const employees: UserEmployee_Core[] = await this.UC_user.getMyEmployees(managerId, userId, userRole);
    
    const employeesDTO = employees.map(employee => UserMapper.FromEntityCore.toReadDTO_Core(employee));

    res.success(employeesDTO, "Liste des employés récupérée avec succès");
  }
  // #endregion

  // #region Update
  /**
   * PATCH /api/users/:id
   * Met à jour un utilisateur
   * - Admin : peut modifier n'importe quel utilisateur (tous les champs)
   * - Manager : peut uniquement modifier son propre profil (firstName, lastName, email, phone)
   * - Employé : peut uniquement modifier son propre profil (firstName, lastName, email, phone)
   * 
   * Note : Les permissions sont vérifiées par le middleware adminOrSelf + logique métier
   */
  async updateUserProfile_ById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ValidationError("ID invalide");

    const userDto: UserUpdateDTO = req.body;
    if (!userDto || Object.keys(userDto).length === 0) {
      throw new ValidationError("Aucune donnée à mettre à jour");
    }

    // Récupération des informations de l'utilisateur connecté
    const requestingUser: UserAuthDTO = req.user!;

    const user = await this.UC_user.updateUserProfile_ById(id, requestingUser, userDto);
    const userDTO = UserMapper.FromEntityCore.toReadUserDTO_Core(user);

    res.success(userDTO, "Utilisateur modifié avec succès");
  }

  /**
   * PATCH /api/users/assign/team/:id
   * Assigner un utilisateur à une équipe
   * - Admin : peut assigner n'importe quel utilisateur
   * - Manager : peut uniquement assigner ses propres employés
   * 
   * Note : Les permissions sont vérifiées par le middleware adminOrSelf + logique métier
   */
  async updateEmployeeTeam_ById(req: Request, res: Response): Promise<void> {
    const userId = Number(req.params.id);
    if (isNaN(userId)) throw new ValidationError("ID utilisateur invalide");

    const dto: UserAsignTeamDTO = req.body;
    if (!dto.teamId) throw new ValidationError("Le teamId est requis");

    // Récupération des informations de l'utilisateur connecté
    const requestingUser: UserAuthDTO = req.user!;

    const user = await this.UC_user.updateEmployeeTeam_ById(userId, dto.teamId, requestingUser);
    const userDTO = UserMapper.FromEntityCore.toReadDTO_Core(user);

    res.success(userDTO, "Utilisateur assigné à l'équipe avec succès");
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
    const requestingUser = req.user!;
    if (isNaN(id)) throw new ValidationError("ID invalide");

    await this.UC_user.deleteUser_ById(id, requestingUser);

    res.success(null, "Utilisateur supprimé avec succès");
  }
  // #endregion
}

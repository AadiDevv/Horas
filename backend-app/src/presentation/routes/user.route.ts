import { Router } from 'express';
import { controllers } from '@/config';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminOnly, managerOrAdmin, adminOrSelf } from '../middlewares/role.middleweare';

const router = Router();
const userController = controllers.UserController();

// #region GET Routes

/**
 * GET /api/users/my-employees
 * Récupère tous les employés du manager connecté
 * Manager + Admin
 * 
 * ⚠️ IMPORTANT : Cette route DOIT être avant /:id pour éviter que "my-employees" soit interprété comme un ID
 */
router.get('/my-employees',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    managerOrAdmin,      // 2️⃣ Vérifie que c'est manager ou admin
    async (req, res, next) => {
        try {
            await userController.getMyEmployees(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/users/:id/schedule
 * Récupère le schedule effectif d'un utilisateur
 * Retourne le customSchedule si défini, sinon le schedule de l'équipe
 * 
 * Permissions :
 * - Employé : peut voir son propre schedule uniquement
 * - Manager : peut voir son schedule et celui de ses employés
 * - Admin : peut voir tous les schedules
 * 
 * ⚠️ IMPORTANT : Cette route DOIT être avant /:id pour éviter que "schedule" soit interprété comme un ID
 */
router.get('/:id/schedule',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    async (req, res, next) => {
        try {
            await userController.getUserSchedule(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/users/:id
 * Détail d'un utilisateur par ID
 * Tous les utilisateurs authentifiés (peuvent voir les profils)
 */
router.get('/:id',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    async (req, res, next) => {
        try {
            await userController.getEmployee_ById(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region PATCH Routes
/**
 * PATCH /api/users/:id
 * Modifier un utilisateur
 * - Admin : peut modifier n'importe quel utilisateur
 * - Manager/Employee : peut uniquement modifier son propre profil
 */
router.patch('/:id',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    async (req, res, next) => {
        try {
            await userController.updateUserProfile_ById(req, res);
        } catch (error) {
            console.log('🟡 ERREUR CAPTURÉE DANS LA ROUTE:', error);
            next(error);
        }
    }
);

/**
 * PATCH /api/users/assign/team/:id
 * Assigner un utilisateur à une équipe
 * - Admin : peut assigner n'importe quel utilisateur
 * - Manager : peut uniquement assigner ses propres employés
 */
router.patch('/assign/team/:id',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    managerOrAdmin,         // 2️⃣ Vérifie que c'est manager ou admin
    async (req, res, next) => {
        try {
            await userController.updateEmployeeTeam_ById(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * PATCH /api/users/assign/schedule/:id
 * Attribuer un custom schedule à un employé
 * - Admin : peut attribuer n'importe quel schedule
 * - Manager : peut attribuer ses propres schedules à ses propres employés
 */
router.patch('/assign/schedule/:id',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    managerOrAdmin,      // 2️⃣ Vérifie que c'est manager ou admin
    async (req, res, next) => {
        try {
            await userController.updateUserCustomSchedule_ById(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region DELETE Routes
/**
 * DELETE /api/users/:id
 * Supprimer un utilisateur (soft delete)
 * Manager ou Admin uniquement
 */
router.delete('/:id',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    managerOrAdmin,           // 2️⃣ Vérifie que c'est admin
    async (req, res, next) => {
        try {
            await userController.deleteUser_ById(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

export default router;


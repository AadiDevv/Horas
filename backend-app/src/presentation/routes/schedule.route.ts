import { Router } from 'express';
import { controllers } from '@/config';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminOnly, managerOrAdmin } from '../middlewares/role.middleweare';

const router = Router();
const scheduleController = controllers.ScheduleController();

// #region GET Routes
/**
 * GET /api/schedules?name=X&activeDays=1,2,3
 * Liste tous les schedules avec filtres optionnels
 * Admin uniquement
 */
router.get('/',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    adminOnly,           // 2️⃣ Vérifie que c'est admin
    async (req, res, next) => {
        try {
            await scheduleController.getAllSchedules(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/schedules/:id?include=users
 * Récupère un schedule par son ID
 * - include=users : inclut la liste des utilisateurs (Admin/Manager uniquement)
 * Tous les utilisateurs authentifiés
 */
router.get('/:id',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    async (req, res, next) => {
        try {
            await scheduleController.getSchedule_ById(req, res);
        } catch (error) {
            next(error);
        }
    }
);


/**
 * GET /api/schedules/team/:teamId
 * Récupère les schedules d'une équipe spécifique
 * Manager de l'équipe ou admin
 */
router.get('/team/:teamId',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    managerOrAdmin,      // 2️⃣ Vérifie que c'est manager ou admin
    // TODO: Ajouter middleware pour vérifier que c'est le manager de l'équipe ou admin
    async (req, res, next) => {
        try {
            await scheduleController.getSchedules_ByTeamId(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/schedules/:id/can-delete
 * Vérifie si un schedule peut être supprimé
 * Admin uniquement
 */
router.get('/:id/can-delete',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    adminOnly,           // 2️⃣ Vérifie que c'est admin
    async (req, res, next) => {
        try {
            await scheduleController.canDeleteSchedule(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region POST Routes
/**
 * POST /api/schedules
 * Crée un nouveau schedule
 * Admin uniquement
 */
router.post('/',
    authMiddleware,
    managerOrAdmin,      // 2️⃣ Vérifie que c'est manager ou admin
    async (req, res, next) => {
        try {
            await scheduleController.createSchedule(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region PATCH Routes
/**
 * PATCH /api/schedules/:id
 * Met à jour un schedule existant
 * Admin uniquement
 */
router.patch('/:id',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    adminOnly,           // 2️⃣ Vérifie que c'est admin
    async (req, res, next) => {
        try {
            await scheduleController.updateSchedule_ById(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region DELETE Routes
/**
 * DELETE /api/schedules/:id
 * Supprime un schedule
 * Admin uniquement
 * ⚠️ Vérifie qu'aucun utilisateur/équipe n'utilise ce schedule
 */
router.delete('/:id',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    adminOnly,           // 2️⃣ Vérifie que c'est admin
    async (req, res, next) => {
        try {
            await scheduleController.deleteSchedule_ById(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

export default router;


import { Router } from 'express';
import { controllers } from '@/config';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminOnly, managerOrAdmin } from '../middlewares/role.middleweare';

const router = Router();
const teamController = controllers.TeamController();

// TODO: Implémenter les routes pour la gestion des équipes
// Architecture similaire à auth.route.ts

// #region GET Routes
/**
 * GET /api/teams?managerId=X
 * Liste des équipes avec logique selon le rôle
 * - Manager: ses équipes uniquement
 * - Admin: toutes les équipes ou filtre par managerId
 */
router.get('/',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    managerOrAdmin,      // 2️⃣ Vérifie que c'est manager ou admin (pas employe)
    async (req, res, next) => {
        try {
            await teamController.getTeams(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/teams/:id
 * Détail d'une équipe par ID
 */
router.get('/:id',
    authMiddleware,
    async (req, res, next) => {
        try {
            await teamController.getTeam_ById(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region POST Routes
/**
 * POST /api/teams
 * Créer une nouvelle équipe (Admin uniquement)
 */
router.post('/',
    authMiddleware,
    managerOrAdmin,           // 3️⃣ Vérifie que c'est admin
    async (req, res, next) => {
        try {
            await teamController.createTeam(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region PATCH Routes
/**
 * PATCH /api/teams/:id
 * Modifier une équipe (Admin uniquement)
 */
router.patch('/:id',
    authMiddleware,
    managerOrAdmin,
    async (req, res, next) => {
        try {
            await teamController.updateTeam(req, res);
        } catch (error) {
            next(error);
        }
    }
);
/**
 * PATCH /api/teams/assign/schedule/:id
 * Assigner un schedule à une équipe
 * - Admin : peut assigner n'importe quel schedule à n'importe quelle équipe
 * - Manager : peut uniquement assigner ses propres schedules à ses propres équipes
 */
router.patch('/assign/schedule/:id',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    managerOrAdmin,         // 2️⃣ Vérifie que c'est admin
    async (req, res, next) => {
        try {
            await teamController.updateTeamSchedule_ById(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// #endregion

// #region DELETE Routes
/**
 * DELETE /api/teams/:id
 * Supprimer une équipe (Admin uniquement)
 */
router.delete('/:id',
    authMiddleware,
    managerOrAdmin,
    async (req, res, next) => {
        try {
            await teamController.deleteTeam(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

export default router;


import { Router } from 'express';
import { controllers } from '@/config';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminOnly, managerOrAdmin } from '../middlewares/role.middleweare';

const router = Router();
const equipeController = controllers.EquipeController();

// TODO: Implémenter les routes pour la gestion des équipes
// Architecture similaire à auth.route.ts

// #region GET Routes
/**
 * GET /api/equipes?managerId=X
 * Liste des équipes avec logique selon le rôle
 * - Manager: ses équipes uniquement
 * - Admin: toutes les équipes ou filtre par managerId
 */
router.get('/',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    managerOrAdmin,      // 2️⃣ Vérifie que c'est manager ou admin (pas employe)
    async (req, res, next) => {
        try {
            await equipeController.getEquipes(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/equipes/:id
 * Détail d'une équipe par ID
 */
router.get('/:id',
    authMiddleware,
    async (req, res, next) => {
        try {
            await equipeController.getEquipe_ById(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region POST Routes
/**
 * POST /api/equipes
 * Créer une nouvelle équipe (Admin uniquement)
 */
router.post('/',
    authMiddleware,
    managerOrAdmin,           // 3️⃣ Vérifie que c'est admin
    async (req, res, next) => {
        try {
            await equipeController.createEquipe(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region PATCH Routes
/**
 * PATCH /api/equipes/:id
 * Modifier une équipe (Admin uniquement)
 */
router.patch('/:id',
    authMiddleware,
    managerOrAdmin,
    async (req, res, next) => {
        try {
            await equipeController.updateEquipe(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region DELETE Routes
/**
 * DELETE /api/equipes/:id
 * Supprimer une équipe (Admin uniquement)
 */
router.delete('/:id',
    authMiddleware,
    managerOrAdmin,
    async (req, res, next) => {
        try {
            await equipeController.deleteEquipe(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

export default router;


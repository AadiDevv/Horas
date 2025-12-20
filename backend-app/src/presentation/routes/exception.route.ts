import { Router } from 'express';
import { controllers } from '@/config';
import { authMiddleware } from '../middlewares/authMiddleware';
import { managerOrAdmin } from '../middlewares/role.middleweare';

const router = Router();
const exceptionController = controllers.ExceptionController();

// #region GET Routes
/**
 * GET /api/exceptions
 * Liste des exceptions avec filtres optionnels
 * - Employé : ses propres exceptions uniquement
 * - Manager : exceptions de ses employés
 * - Admin : toutes les exceptions
 */
router.get('/',
    authMiddleware,
    async (req, res, next) => {
        try {
            await exceptionController.getExceptions(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/exceptions/pending
 * Liste des exceptions en attente pour le manager connecté
 * - Manager/Admin uniquement
 */
router.get('/pending',
    authMiddleware,
    managerOrAdmin,
    async (req, res, next) => {
        try {
            await exceptionController.getPendingExceptions(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/exceptions/:id
 * Détail d'une exception par ID
 * - Employé : ses propres exceptions uniquement
 * - Manager : exceptions de ses employés
 * - Admin : toutes les exceptions
 */
router.get('/:id',
    authMiddleware,
    async (req, res, next) => {
        try {
            await exceptionController.getExceptionById(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region POST Routes
/**
 * POST /api/exceptions
 * Crée une nouvelle exception
 * - Employé : crée pour lui-même (status = 'en_attente')
 * - Manager : peut créer pour ses employés
 * - Admin : peut créer pour n'importe qui
 */
router.post('/',
    authMiddleware,
    async (req, res, next) => {
        try {
            await exceptionController.createException(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region PATCH Routes
/**
 * PATCH /api/exceptions/:id
 * Met à jour une exception (statut 'en_attente' uniquement)
 * - Employé : peut modifier ses propres exceptions en attente
 * - Manager : peut modifier les exceptions de ses employés en attente
 * - Admin : peut tout modifier
 */
router.patch('/:id',
    authMiddleware,
    async (req, res, next) => {
        try {
            await exceptionController.updateException(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * PATCH /api/exceptions/:id/validate
 * Valide ou refuse une exception
 * - Manager/Admin uniquement
 */
router.patch('/:id/validate',
    authMiddleware,
    managerOrAdmin,
    async (req, res, next) => {
        try {
            await exceptionController.validateException(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region DELETE Routes
/**
 * DELETE /api/exceptions/:id
 * Supprime une exception (soft delete, statut 'en_attente' uniquement)
 * - Employé : peut supprimer ses propres exceptions en attente
 * - Manager : peut supprimer les exceptions de ses employés en attente
 * - Admin : peut tout supprimer
 */
router.delete('/:id',
    authMiddleware,
    async (req, res, next) => {
        try {
            await exceptionController.deleteException(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

export default router;

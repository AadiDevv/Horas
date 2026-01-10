import { Router } from 'express';
import { controllers } from '@/config';
import { authMiddleware } from '../middlewares/authMiddleware';
import { managerOrAdmin } from '../middlewares/role.middleweare';

const router = Router();
const absenceController = controllers.AbsenceController();

// #region GET Routes
/**
 * GET /api/absences
 * Liste des absences avec filtres optionnels
 * - Employé : ses propres absences uniquement
 * - Manager : absences de ses employés
 * - Admin : toutes les absences
 */
router.get('/',
    authMiddleware,
    async (req, res, next) => {
        try {
            await absenceController.getAbsences(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/absences/pending
 * Liste des absences en attente pour le manager connecté
 * - Manager/Admin uniquement
 */
router.get('/pending',
    authMiddleware,
    managerOrAdmin,
    async (req, res, next) => {
        try {
            await absenceController.getPendingAbsences(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/absences/:id
 * Détail d'une absence par ID
 * - Employé : ses propres absences uniquement
 * - Manager : absences de ses employés
 * - Admin : toutes les absences
 */
router.get('/:id',
    authMiddleware,
    async (req, res, next) => {
        try {
            await absenceController.getAbsenceById(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region POST Routes
/**
 * POST /api/absences
 * Crée une nouvelle absence
 * - Employé : crée pour lui-même (status = 'en_attente')
 * - Manager : peut créer pour ses employés
 * - Admin : peut créer pour n'importe qui
 */
router.post('/',
    authMiddleware,
    async (req, res, next) => {
        try {
            await absenceController.createAbsence(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region PATCH Routes
/**
 * PATCH /api/absences/:id
 * Met à jour une absence (statut 'en_attente' uniquement)
 * - Employé : peut modifier ses propres absences en attente
 * - Manager : peut modifier les absences de ses employés en attente
 * - Admin : peut tout modifier
 */
router.patch('/:id',
    authMiddleware,
    async (req, res, next) => {
        try {
            await absenceController.updateAbsence(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * PATCH /api/absences/:id/validate
 * Valide ou refuse une absence
 * - Manager/Admin uniquement
 */
router.patch('/:id/validate',
    authMiddleware,
    managerOrAdmin,
    async (req, res, next) => {
        try {
            await absenceController.validateAbsence(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region DELETE Routes
/**
 * DELETE /api/absences/:id
 * Supprime une absence (soft delete, statut 'en_attente' uniquement)
 * - Employé : peut supprimer ses propres absences en attente
 * - Manager : peut supprimer les absences de ses employés en attente
 * - Admin : peut tout supprimer
 */
router.delete('/:id',
    authMiddleware,
    async (req, res, next) => {
        try {
            await absenceController.deleteAbsence(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

export default router;

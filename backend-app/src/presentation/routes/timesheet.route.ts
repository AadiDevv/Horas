import { Router } from 'express';
import { controllers } from '@/config';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminOnly, managerOrAdmin } from '../middlewares/role.middleweare';

const router = Router();
const timesheetController = controllers.TimesheetController();

// #region GET Routes
/**
 * GET /api/timesheets
 * Liste des timesheets avec filtres optionnels
 * - Employé : ses propres timesheets uniquement
 * - Manager/Admin : tous ou par employeId
 */
router.get('/',
    authMiddleware,
    async (req, res, next) => {
        try {
            await timesheetController.getTimesheets(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/timesheets/stats/
 * Stats d'un employé
 */
router.get('/stats',
    authMiddleware,
    async (req, res, next) => {
        try {
            await timesheetController.getStats(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/timesheets/:id
 * Détail d’un timesheet par ID
 */
router.get('/:id',
    authMiddleware,
    async (req, res, next) => {
        try {
            await timesheetController.getTimesheetById(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region POST Routes
/**
 * POST /api/timesheets/clockin
 * - Employé uniquement
 */
router.post('/clockin',
    authMiddleware,
    async (req, res, next) => {
        try {
            await timesheetController.createTimesheet(req, res, true);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/timesheets/clockout
 * - Employé uniquement
 */
router.post('/clockout',
    authMiddleware,
    async (req, res, next) => {
        try {
            await timesheetController.createTimesheet(req, res, false);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region PATCH Routes
/**
 * PATCH /api/timesheets/:id
 * Mise à jour d’un timesheet (par un manager/admin)
 */
router.patch('/:id',
    authMiddleware,
    managerOrAdmin,
    async (req, res, next) => {
        try {
            await timesheetController.updateTimesheet(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

// #region DELETE Routes
/**
 * DELETE /api/timesheets/:id
 * Suppression d’un timesheet (par un manager/admin)
 */
router.delete('/:id',
    authMiddleware,
    managerOrAdmin,
    async (req, res, next) => {
        try {
            await timesheetController.deleteTimesheet(req, res);
        } catch (error) {
            next(error);
        }
    }
);
// #endregion

export default router;

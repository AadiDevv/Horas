import { Router } from 'express';
import { controllers } from '@/config';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminOnly, managerOrAdmin } from '../middlewares/role.middleweare';

const router = Router();
const authController = controllers.AuthController()


// Création d'employé (manager ou admin uniquement)
router.post('/register/employe',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    managerOrAdmin,      // 2️⃣ Vérifie que c'est manager ou admin
    async (req, res, next) => {
        try {
            await authController.registerEmploye(req, res)
        } catch (error) {
            next(error)
        }
    }
);

// Création de manager (admin uniquement)
router.post('/register/manager',
    authMiddleware,      // 1️⃣ Vérifie le JWT
    adminOnly,           // 2️⃣ Vérifie que c'est admin
    async (req, res, next) => {
        try {
            await authController.registerManager(req, res)
        } catch (error) {
            next(error)
        }
    }
);

// Connexion publique
router.post('/login', async (req, res, next) => {
    try {
        await authController.login(req, res)
    } catch (error) {
        next(error)
    }
});

export default router;

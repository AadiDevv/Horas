import { Router } from 'express';
import { controllers } from '@/config';

const router = Router();
const authController = controllers.AuthController()

router.post('/register', async (req, res, next) => {
    try {
        await authController.register(req, res)
    } catch (error) {
        next(error)
    }
});

router.post('/login', async (req, res, next) => {
    try {
        await authController.login(req, res)
    } catch (error) {
        next(error)
    }
});

export default router;

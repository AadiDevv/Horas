import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

router.use(authMiddleware); // protège les routes déclarées après

router.get('/home', userController.getAllUsers);

export default router;
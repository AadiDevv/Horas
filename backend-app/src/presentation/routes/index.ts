import { Router } from 'express';
import healthRoutes from './health.route';
import userRoutes from './auth.route';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);

export default router;

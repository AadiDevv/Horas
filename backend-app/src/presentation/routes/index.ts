import { Router } from 'express';
import healthRoutes from './health.route';
import userRoutes from './auth.route';
import teamRoutes from './team.route';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);

export default router;

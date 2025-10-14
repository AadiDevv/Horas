import { Router } from 'express';
import healthRoutes from './health.route';
import userRoutes from './auth.route';
import equipeRoutes from './equipe.route';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/equipes', equipeRoutes);

export default router;

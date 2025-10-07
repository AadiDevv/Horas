import { Router } from 'express';
import healthRoutes from './healthRoutes';
import apiRoutes from './apiRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/', apiRoutes);

export default router;

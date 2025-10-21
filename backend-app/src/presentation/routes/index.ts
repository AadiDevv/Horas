import { Router } from 'express';
import healthRoutes from './health.route';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import teamRoutes from './team.route';
import timesheetRoutes from './timesheet.route';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);
router.use('/timesheets', timesheetRoutes);

export default router;

import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { getStreakController } from './streak.controller';

const router = Router();

router.use(authMiddleware);
router.get('/', getStreakController);

export default router;

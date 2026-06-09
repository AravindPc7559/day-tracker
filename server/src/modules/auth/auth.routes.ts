import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createProfileSchema, updateProfileSchema } from './auth.schema';
import { getProfile, createProfile, updateProfile } from './auth.controller';

const router = Router();

router.get('/profile', authMiddleware, getProfile);
router.post('/profile', authMiddleware, validate(createProfileSchema), createProfile);
router.patch('/profile', authMiddleware, validate(updateProfileSchema), updateProfile);

export default router;

import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createProfileSchema, updateProfileSchema, savePushTokenSchema } from './auth.schema';
import { getProfile, createProfile, updateProfile, savePushTokenController, deleteAccountController } from './auth.controller';

const router = Router();

router.get('/profile', authMiddleware, getProfile);
router.post('/profile', authMiddleware, validate(createProfileSchema), createProfile);
router.patch('/profile', authMiddleware, validate(updateProfileSchema), updateProfile);
router.patch('/push-token', authMiddleware, validate(savePushTokenSchema), savePushTokenController);
router.delete('/account', authMiddleware, deleteAccountController);

export default router;

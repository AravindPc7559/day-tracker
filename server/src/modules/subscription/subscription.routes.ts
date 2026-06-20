import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { revenueCatWebhookSchema } from './subscription.schema';
import { webhookController, getStatusController } from './subscription.controller';

const router = Router();

router.post('/webhook', validate(revenueCatWebhookSchema), webhookController);
router.get('/status', authMiddleware, getStatusController);

export default router;

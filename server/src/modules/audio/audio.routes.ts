import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { confirmSaveSchema, processTextSchema } from './audio.schema';
import {
  processAudioController,
  processTextController,
  confirmSaveController,
} from './audio.controller';

const upload = multer({
  dest: '/tmp/',
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router = Router();

router.use(authMiddleware);

router.post('/process', upload.single('audio'), processAudioController);
router.post('/process-text', validate(processTextSchema), processTextController);
router.post('/confirm', validate(confirmSaveSchema), confirmSaveController);

export default router;

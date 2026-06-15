import { Router } from 'express';
import multer from 'multer';
import { processImageController } from './image.controller';

const upload = multer({
  dest: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = Router();

router.post('/process', upload.single('image'), processImageController);

export default router;

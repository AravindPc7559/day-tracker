import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { ValidationError } from '../../utils/errors';
import { processImage } from './image.service';

export const processImageController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ValidationError('Image file is required');
  }
  const result = await processImage(req.file.path);
  sendSuccess(res, result, 'Image processed successfully');
});

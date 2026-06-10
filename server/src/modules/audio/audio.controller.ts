import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { ValidationError } from '../../utils/errors';
import { processAudio, processText, confirmSave } from './audio.service';
import type { ConfirmSaveInput, ProcessTextInput } from './audio.schema';

export const processAudioController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ValidationError('Audio file is required');
  }
  const result = await processAudio(req.file.path, req.file.originalname);
  sendSuccess(res, result, 'Audio processed successfully');
});

export const processTextController = asyncHandler(async (req: Request, res: Response) => {
  const { text } = req.validatedBody as ProcessTextInput;
  const result = await processText(text);
  sendSuccess(res, result, 'Text processed successfully');
});

export const confirmSaveController = asyncHandler(async (req: Request, res: Response) => {
  const input = req.validatedBody as ConfirmSaveInput;
  const result = await confirmSave(req.user!.uid, input);
  sendSuccess(res, result, 'Entry saved successfully', 201);
});

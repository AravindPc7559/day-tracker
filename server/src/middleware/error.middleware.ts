import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(err.message, { stack: err.stack, name: err.name });

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.code);
    return;
  }

  const errWithCode = err as Error & { code?: string };
  if (
    err.name === 'FirebaseAuthError' ||
    errWithCode.code?.startsWith('auth/') ||
    errWithCode.code?.startsWith('app/')
  ) {
    sendError(res, 'Authentication error', 401, 'FIREBASE_AUTH_ERROR');
    return;
  }

  sendError(res, 'Internal server error', 500, 'INTERNAL_ERROR');
};

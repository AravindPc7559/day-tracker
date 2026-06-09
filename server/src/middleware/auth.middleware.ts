import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebase';
import { UnauthorizedError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';

export const authMiddleware = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email ?? '',
      emailVerified: decodedToken.email_verified ?? false,
    };

    next();
  }
);

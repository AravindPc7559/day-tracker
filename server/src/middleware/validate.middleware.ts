import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

type ValidateTarget = 'body' | 'params' | 'query';

export const validate =
  (schema: ZodSchema, target: ValidateTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const message = result.error.issues.map((e) => e.message).join(', ');
      return next(new ValidationError(message));
    }

    if (target === 'body') req.validatedBody = result.data;
    if (target === 'params') req.validatedParams = result.data;
    if (target === 'query') req.validatedQuery = result.data;

    next();
  };

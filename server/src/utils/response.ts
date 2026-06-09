import type { Response } from 'express';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
) => res.status(statusCode).json({ success: true, message, data });

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  message: string,
  meta: PaginationMeta
) => res.status(200).json({ success: true, message, data, meta });

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details?: unknown
) => res.status(statusCode).json({ success: false, message, error: { code, details } });

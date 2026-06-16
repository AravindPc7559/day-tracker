import axios from 'axios';
import type { AxiosError } from 'axios';

type ApiErrorBody = { message?: string; error?: { code?: string } };

export const extractErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<ApiErrorBody>;

    if (!axiosErr.response) {
      return 'No internet connection. Please check your network and try again.';
    }

    const { status, data } = axiosErr.response;

    if (status === 429 || data?.error?.code === 'RATE_LIMIT_EXCEEDED') {
      return 'Too many requests. Please wait a few minutes and try again.';
    }

    if (data?.message) return data.message;
  }

  if (err instanceof Error) return err.message;

  return 'Something went wrong. Please try again.';
};

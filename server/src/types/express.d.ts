declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        emailVerified: boolean;
      };
      validatedBody?: unknown;
      validatedParams?: unknown;
      validatedQuery?: unknown;
    }
  }
}

export {};

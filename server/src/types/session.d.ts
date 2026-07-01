import "express";

declare global {
  namespace Express {
    interface Request {
      session: Record<string, any>;
      sessionID: string;
    }
  }
}

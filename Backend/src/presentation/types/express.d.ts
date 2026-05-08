/**
 * Express type augmentation – Presentation Layer
 * Extends the Express Request interface to include the authenticated user.
 * Import this file once in app.ts or via tsconfig "types" to make it global.
 */
import { Request } from "express";
import { TokenPayload } from "../../domain/interfaces/ITokenService";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};

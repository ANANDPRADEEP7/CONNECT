import { TokenPayload } from "../../domain/interfaces/ITokenService";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};

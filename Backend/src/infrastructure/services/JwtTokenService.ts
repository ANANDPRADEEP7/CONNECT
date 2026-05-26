import jwt from "jsonwebtoken";
import { ITokenService, TokenPayload } from "../../domain/interfaces/ITokenService";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret";

export class JwtTokenService implements ITokenService {
  generateResetToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "10m" });
  }

  verifyResetToken(token: string): string | null {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      return payload.userId;
    } catch {
      return null;
    }
  }

  generateAuthToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
  }

  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }
}

import jwt from "jsonwebtoken";
import { ITokenService } from "../../domain/interfaces/ITokenService";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

/**
 * JWT Token Service - Infrastructure layer
 * Handles generating and verifying short-lived password-reset tokens
 */
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

    generateAuthToken(payload: any): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    }

    verifyToken(token: string): any {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch {
            return null;
        }
    }
}

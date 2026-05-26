/**
 * Token Service interface - Domain layer abstraction
 * Defines the contract for generating and verifying reset tokens
 */
export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface ITokenService {
  generateResetToken(userId: string): string;
  verifyResetToken(token: string): string | null;
  generateAuthToken(payload: TokenPayload): string;
  verifyToken(token: string): TokenPayload | null;
  generateRefreshToken(payload: TokenPayload): string;
  verifyRefreshToken(token: string): TokenPayload | null;
}

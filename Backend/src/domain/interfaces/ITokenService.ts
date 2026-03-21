/**
 * Token Service interface - Domain layer abstraction
 * Defines the contract for generating and verifying reset tokens
 */
export interface ITokenService {
    generateResetToken(userId: string): string;
    verifyResetToken(token: string): string | null;
    generateAuthToken(payload: any): string;
    verifyToken(token: string): any;
}

/**
 * Cache Service interface - Domain layer abstraction
 * Defines the contract for storing and retrieving reset tokens
 */
export interface ICacheService {
  storeResetToken(userId: string, token: string, ttlSeconds: number): Promise<void>;
  getResetToken(userId: string): Promise<string | null>;
  delete(userId: string): Promise<void>;
}

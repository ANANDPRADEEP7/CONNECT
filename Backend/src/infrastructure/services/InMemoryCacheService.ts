import { ICacheService } from "../../domain/interfaces/ICacheService";

interface CacheEntry {
    token: string;
    expiresAt: number;
}

/**
 * In-Memory Cache Service - Infrastructure layer
 * Stores reset tokens in memory with TTL support
 * (For production, replace with Redis implementation)
 */
export class InMemoryCacheService implements ICacheService {
    private store = new Map<string, CacheEntry>();

    async storeResetToken(userId: string, token: string, ttlSeconds: number): Promise<void> {
        this.store.set(userId, {
            token,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }

    async getResetToken(userId: string): Promise<string | null> {
        const entry = this.store.get(userId);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.store.delete(userId);
            return null;
        }

        return entry.token;
    }

    async delete(userId: string): Promise<void> {
        this.store.delete(userId);
    }
}

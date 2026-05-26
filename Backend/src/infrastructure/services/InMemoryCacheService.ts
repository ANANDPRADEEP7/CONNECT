import { ICacheService } from "../../domain/interfaces/ICacheService";

interface CacheEntry {
  token: string;
  expiresAt: number;
}

export class InMemoryCacheService implements ICacheService {
  private _store = new Map<string, CacheEntry>();

  async storeResetToken(userId: string, token: string, ttlSeconds: number): Promise<void> {
    this._store.set(userId, {
      token,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async getResetToken(userId: string): Promise<string | null> {
    const entry = this._store.get(userId);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this._store.delete(userId);
      return null;
    }

    return entry.token;
  }

  async delete(userId: string): Promise<void> {
    this._store.delete(userId);
  }
}

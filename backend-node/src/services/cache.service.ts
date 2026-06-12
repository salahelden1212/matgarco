import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class CacheService {
  private client: Redis | null = null;
  private memoryCache = new Map<string, { data: string; expiresAt: number }>();
  private useMemory = false;

  constructor() {
    if (!process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
      this.useMemory = true;
    }
  }

  private async getClient(): Promise<Redis> {
    if (!this.client) {
      try {
        this.client = new Redis(REDIS_URL, {
          maxRetriesPerRequest: 3,
          enableOfflineQueue: false,
          lazyConnect: true,
        });
        await this.client.connect();
      } catch {
        this.useMemory = true;
        this.client = null;
      }
    }
    return this.client!;
  }

  async get(key: string): Promise<string | null> {
    if (this.useMemory) {
      const entry = this.memoryCache.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) {
        this.memoryCache.delete(key);
        return null;
      }
      return entry.data;
    }

    try {
      const client = await this.getClient();
      return await client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds: number = 300): Promise<void> {
    if (this.useMemory) {
      this.memoryCache.set(key, { data: value, expiresAt: Date.now() + ttlSeconds * 1000 });
      if (this.memoryCache.size > 1000) {
        const now = Date.now();
        for (const [k, v] of this.memoryCache) {
          if (now > v.expiresAt) this.memoryCache.delete(k);
        }
      }
      return;
    }

    try {
      const client = await this.getClient();
      await client.set(key, value, 'EX', ttlSeconds);
    } catch {
      // fallback: store in memory
      this.memoryCache.set(key, { data: value, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
  }

  async del(key: string): Promise<void> {
    if (this.useMemory) {
      this.memoryCache.delete(key);
      return;
    }
    try {
      const client = await this.getClient();
      await client.del(key);
    } catch {
      this.memoryCache.delete(key);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    if (this.useMemory) {
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern)) this.memoryCache.delete(key);
      }
      return;
    }
    try {
      const client = await this.getClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) await client.del(...keys);
    } catch {
      // ignore
    }
  }

  async flushAll(): Promise<void> {
    this.memoryCache.clear();
    try {
      const client = await this.getClient();
      await client.flushall();
    } catch {
      // ignore
    }
  }

  get memorySize(): number {
    return this.memoryCache.size;
  }
}

export const cacheService = new CacheService();

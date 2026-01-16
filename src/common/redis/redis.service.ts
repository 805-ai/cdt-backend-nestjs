import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient } from 'redis';
import { REDIS_CONFIG } from '../config/secrets';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: ReturnType<typeof createClient>;

  async onModuleInit() {
    this.client = createClient({
      url: `redis://${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`,
      password: REDIS_CONFIG.password,
    });

    this.client.on('error', (err) => console.error('Redis error:', err));
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }

  async increment(key: string): Promise<number> {
    return Number(await this.client.incr(key));
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    return Boolean(await this.client.expire(key, seconds));
  }

  async get(key: string): Promise<string | null> {
    const result = await this.client.get(key);
    return result ? String(result) : null;
  }

  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    if (expireSeconds) {
      await this.client.setEx(key, expireSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }
}

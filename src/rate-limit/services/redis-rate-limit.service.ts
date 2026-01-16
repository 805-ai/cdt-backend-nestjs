import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class RedisRateLimitService {
  constructor(private readonly redis: RedisService) {}

  async checkRateLimit(key: string, limit: number, windowSeconds: number = 3600): Promise<boolean> {
    const redisKey = `rate_limit:${key}`;
    const current = await this.redis.increment(redisKey);

    if (current === 1) {
      await this.redis.expire(redisKey, windowSeconds);
    }

    return current <= limit;
  }

  async getRemainingRequests(key: string): Promise<number> {
    const redisKey = `rate_limit:${key}`;
    const current = await this.redis.get(redisKey);
    return current ? parseInt(current) : 0;
  }
}

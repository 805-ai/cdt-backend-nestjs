import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartnerModule } from 'src/partner/partner.module';
import { RedisModule } from 'src/common/redis/redis.module';
import { RateLimitController } from './controllers/rate-limit.controller';
import { RateLimitDAO } from './daos/rate-limit.dao';
import { RateLimit, RateLimitSchema } from './schemas/rate-limit.schema';
import { RateLimitService } from './services/rate-limit.service';
import { RedisRateLimitService } from './services/redis-rate-limit.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: RateLimit.name, schema: RateLimitSchema }]), PartnerModule, RedisModule],
  controllers: [RateLimitController],
  providers: [RateLimitService, RateLimitDAO, RedisRateLimitService],
  exports: [RateLimitDAO, RateLimitService, RedisRateLimitService],
})
export class RateLimitModule {}

import { Request, Response, NextFunction } from 'express';
import * as redis from 'redis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import BaseError from '@common/errors/base-error';
import { errorMessages } from '@common/errors/messages';
import { get } from 'env-var';

const redisClient = redis.createClient({
  password: get('REDIS_PASS').asString() || undefined,
  socket: {
    host: get('REDIS_HOST').asString() || 'localhost',
    port: get('REDIS_PORT').asInt() || 6379,
  },
});

redisClient.connect().catch(err => console.log(err));

const limiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'ratelimit',
  points: 5,
  duration: 1,
});

export default async function rateLimiter(
  request: Request,
  respose: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await limiter.consume(request.ip!);

    return next();
  } catch (error) {
    throw new BaseError(errorMessages.TOO_MANY_REQUESTS);
  }
}

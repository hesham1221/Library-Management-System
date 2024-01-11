import { get } from 'env-var';
import { RedisOptions } from 'ioredis';

interface ICacheConfig {
  config: {
    redis: RedisOptions;
  };
  driver: string;
}

export default {
  config: {
    redis: {
      host: get('REDIS_HOST').required().asString(),
      port: get('REDIS_PORT').asInt() || 6379,
      password: get('REDIS_PASSWORD').asString(),
    },
  },
  driver: 'redis',
} as ICacheConfig;

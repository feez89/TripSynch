import Redis from 'ioredis';

let redis: Redis | null = null;

export const getRedis = (): Redis => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
    redis.on('error', (err) => {
      console.warn('Redis connection error (non-fatal):', err.message);
    });
  }
  return redis;
};

export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    return await getRedis().get(key);
  } catch {
    return null;
  }
};

export const cacheSet = async (key: string, value: string, ttlSeconds = 300): Promise<void> => {
  try {
    await getRedis().setex(key, ttlSeconds, value);
  } catch {
    // non-fatal
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    await getRedis().del(key);
  } catch {}
};

import Redis from 'ioredis';

// Redis 客户端单例
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL;

  if (!url) {
    console.warn('⚠️ REDIS_URL not set, using memory cache fallback');
    // 返回一个模拟的Redis客户端用于开发
    return new Redis({
      host: 'localhost',
      port: 6379,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }

  return new Redis(url, {
    maxRetriesPerRequest: 3,
  });
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// ============= 缓存工具函数 =============

/**
 * 获取或设置缓存
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600 // 默认1小时
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }

    const data = await fetcher();
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
    return data;
  } catch {
    // Redis连接失败时直接执行fetcher
    return fetcher();
  }
}

/**
 * 删除缓存
 */
export async function invalidate(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidation failed:', error);
  }
}

/**
 * 缓存键前缀
 */
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  item: (id: string) => `item:${id}`,
  itemList: (page: number, size: number) => `items:${page}:${size}`,
  category: () => 'categories',
};

export default redis;

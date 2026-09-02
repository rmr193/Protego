import { createClient } from 'redis';
import { logger } from '../utils/logger';
import { env } from '../../config/env';

// In-memory cache fallback if Redis server is unavailable
const memoryCache = new Map<string, string>();

let isRedisConnected = false;

export const redisClient = createClient({
  url: env.REDIS_URL,
  socket: {
    connectTimeout: 1500,
    reconnectStrategy: false
  }
});

redisClient.on('error', (err) => {
  // Log once and operate gracefully
  if (isRedisConnected) {
    logger.error('Redis Client Error', err);
  }
});

redisClient.on('connect', () => {
  isRedisConnected = true;
  logger.info('Redis Client Connected');
});

export const connectRedis = async () => {
  try {
    // Attempt connection without blocking main thread
    redisClient.connect().catch(() => {
      isRedisConnected = false;
      logger.warn('Redis server not reachable, using in-memory cache fallback.');
    });
  } catch {
    isRedisConnected = false;
  }
};

export const cacheGet = async (key: string): Promise<string | null> => {
  if (isRedisConnected && redisClient.isOpen) {
    try {
      return await redisClient.get(key);
    } catch {
      return memoryCache.get(key) || null;
    }
  }
  return memoryCache.get(key) || null;
};

export const cacheSet = async (key: string, value: string, expireSeconds?: number): Promise<void> => {
  memoryCache.set(key, value);
  if (isRedisConnected && redisClient.isOpen) {
    try {
      if (expireSeconds) {
        await redisClient.set(key, value, { EX: expireSeconds });
      } else {
        await redisClient.set(key, value);
      }
    } catch {
      // Ignored, memoryCache already set
    }
  }
};



"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheSet = exports.cacheGet = exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
const env_1 = require("../../config/env");
// In-memory cache fallback if Redis server is unavailable
const memoryCache = new Map();
let isRedisConnected = false;
exports.redisClient = (0, redis_1.createClient)({
    url: env_1.env.REDIS_URL,
    socket: {
        connectTimeout: 1500,
        reconnectStrategy: false
    }
});
exports.redisClient.on('error', (err) => {
    // Log once and operate gracefully
    if (isRedisConnected) {
        logger_1.logger.error('Redis Client Error', err);
    }
});
exports.redisClient.on('connect', () => {
    isRedisConnected = true;
    logger_1.logger.info('Redis Client Connected');
});
const connectRedis = async () => {
    try {
        // Attempt connection without blocking main thread
        exports.redisClient.connect().catch(() => {
            isRedisConnected = false;
            logger_1.logger.warn('Redis server not reachable, using in-memory cache fallback.');
        });
    }
    catch {
        isRedisConnected = false;
    }
};
exports.connectRedis = connectRedis;
const cacheGet = async (key) => {
    if (isRedisConnected && exports.redisClient.isOpen) {
        try {
            return await exports.redisClient.get(key);
        }
        catch {
            return memoryCache.get(key) || null;
        }
    }
    return memoryCache.get(key) || null;
};
exports.cacheGet = cacheGet;
const cacheSet = async (key, value, expireSeconds) => {
    memoryCache.set(key, value);
    if (isRedisConnected && exports.redisClient.isOpen) {
        try {
            if (expireSeconds) {
                await exports.redisClient.set(key, value, { EX: expireSeconds });
            }
            else {
                await exports.redisClient.set(key, value);
            }
        }
        catch {
            // Ignored, memoryCache already set
        }
    }
};
exports.cacheSet = cacheSet;

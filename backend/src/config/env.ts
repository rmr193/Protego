import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().default(process.env.DATABASE_URL || ''),
  JWT_SECRET: z.string().default(process.env.JWT_SECRET || 'default_super_secret_jwt_key_protego_command_network_2026'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().default(process.env.JWT_REFRESH_SECRET || 'default_super_secret_refresh_jwt_key_protego_2026'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().optional(),
  AI_SERVICE_URL: z.string().default('http://localhost:8000'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional()
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('⚠️ Environment variables warning:\n', _env.error.format());
}

export const env = _env.success ? _env.data : {
  NODE_ENV: 'production' as const,
  PORT: '5000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'default_super_secret_jwt_key_protego_command_network_2026',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default_super_secret_refresh_jwt_key_protego_2026',
  JWT_REFRESH_EXPIRES_IN: '7d',
  REDIS_URL: process.env.REDIS_URL,
  AI_SERVICE_URL: 'http://localhost:8000',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};

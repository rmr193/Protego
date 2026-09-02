import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/utils/logger';

const prisma = new PrismaClient();
logger.info('Initialized real Prisma Client connected to Supabase.');

export default prisma;

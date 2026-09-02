"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const logger_1 = require("../shared/utils/logger");
const prisma = new client_1.PrismaClient();
logger_1.logger.info('Initialized real Prisma Client connected to Supabase.');
exports.default = prisma;

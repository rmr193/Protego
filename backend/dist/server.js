"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./shared/utils/logger");
const socket_service_1 = require("./shared/services/socket.service");
const redis_service_1 = require("./shared/services/redis.service");
const server = http_1.default.createServer(app_1.default);
// Initialize Socket.io
(0, socket_service_1.initSocket)(server);
const startServer = async () => {
    try {
        // Connect to Redis
        await (0, redis_service_1.connectRedis)();
        // Start server
        server.listen(env_1.env.PORT, () => {
            logger_1.logger.info(`Server is running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode.`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
    logger_1.logger.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
process.on('SIGTERM', () => {
    logger_1.logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        logger_1.logger.info('💥 Process terminated!');
    });
});

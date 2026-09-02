"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastEvent = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = require("../utils/logger");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // Allow all origins for development and local testing
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        }
    });
    io.on('connection', (socket) => {
        logger_1.logger.info(`New client connected: ${socket.id}`);
        // Allow clients to join specific rooms (e.g., station_123, citizen_alerts)
        socket.on('join_room', (room) => {
            socket.join(room);
            logger_1.logger.info(`Socket ${socket.id} joined room ${room}`);
        });
        socket.on('disconnect', () => {
            logger_1.logger.info(`Client disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    return io;
};
exports.getIO = getIO;
const broadcastEvent = (eventName, payload) => {
    if (io) {
        try {
            io.emit(eventName, payload);
        }
        catch (e) {
            logger_1.logger.warn(`Failed to broadcast event ${eventName}: ${e.message}`);
        }
    }
};
exports.broadcastEvent = broadcastEvent;

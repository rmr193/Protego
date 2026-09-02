import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for development and local testing
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Allow clients to join specific rooms (e.g., station_123, citizen_alerts)
    socket.on('join_room', (room: string) => {
      socket.join(room);
      logger.info(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

export const broadcastEvent = (eventName: string, payload: any) => {
  if (io) {
    try {
      io.emit(eventName, payload);
    } catch (e: any) {
      logger.warn(`Failed to broadcast event ${eventName}: ${e.message}`);
    }
  }
};


import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../types';

let io: SocketServer;

export function initializeWebSocket(server: HttpServer): SocketServer {
  io = new SocketServer(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      next(new Error('Authentication required'));
      return;
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as JwtPayload;
    console.log(`User connected: ${user.email}`);

    socket.join(`user:${user.userId}`);
    socket.join(`role:${user.role}`);

    socket.on('join-schedule', (scheduleId: string) => {
      socket.join(`schedule:${scheduleId}`);
    });

    socket.on('leave-schedule', (scheduleId: string) => {
      socket.leave(`schedule:${scheduleId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.email}`);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  return io;
}

export function emitScheduleUpdate(scheduleId: string, data: unknown): void {
  if (io) {
    io.to(`schedule:${scheduleId}`).emit('schedule-updated', data);
  }
}

export function emitNotification(userId: string, notification: unknown): void {
  if (io) {
    io.to(`user:${userId}`).emit('new-notification', notification);
  }
}

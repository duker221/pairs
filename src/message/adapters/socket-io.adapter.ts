import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import type { AuthenticatedSocket } from '../types/socket.types';

export class SocketIoAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIoAdapter.name);

  constructor(
    private app: INestApplicationContext,
    private jwtService: JwtService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        credentials: true,
      },
    }) as Server;

    // Apply authentication middleware to all namespaces
    server.of(/.*/).use((socket: AuthenticatedSocket, next) => {
      void (async () => {
        try {
          // Extract token from auth or headers
          const authToken: unknown = socket.handshake.auth?.token;
          const headerAuth = socket.handshake.headers?.authorization;

          const rawToken =
            typeof authToken === 'string' ? authToken : headerAuth;

          const token =
            typeof rawToken === 'string'
              ? rawToken.replace('Bearer ', '')
              : undefined;

          if (!token) {
            this.logger.warn(
              `WebSocket auth failed: token missing for ${socket.id}`,
            );
            return next(new Error('Authentication token missing'));
          }

          // Verify and decode JWT
          const payload = this.jwtService.verify<{
            sub: number;
            email: string;
          }>(token, { secret: process.env.JWT_SECRET });

          // Get user via AuthService
          const authService = this.app.get(AuthService);
          const user = await authService.validateUser(payload.sub);

          // Store user in socket data
          socket.data.user = user;

          this.logger.log(`WebSocket authenticated: user ${user.id}`);
          next();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Authentication failed';
          this.logger.error(`WebSocket auth error: ${message}`);
          next(new Error('Authentication failed'));
        }
      })();
    });

    return server;
  }
}

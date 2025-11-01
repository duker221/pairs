import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { INestApplicationContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import type { AuthenticatedSocket } from '../types/socket.types';
import type { JwtPayload } from 'src/auth/types/auth-response.types';

export class SocketIoAdapter extends IoAdapter {
  constructor(
    private app: INestApplicationContext,
    private jwtService: JwtService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        credentials: true,
      },
    });

    // Middleware для аутентификации
    const authMiddleware = async (
      socket: AuthenticatedSocket,
      next: (err?: Error) => void,
    ) => {
      try {
        console.log('🔍 WebSocket auth attempt:', {
          auth: socket.handshake.auth,
          headers: socket.handshake.headers.authorization,
          namespace: socket.nsp.name,
        });

        // Получаем токен из query параметров или headers
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace('Bearer ', '');

        console.log('🔑 Token received:', token ? 'YES' : 'NO');

        if (!token || typeof token !== 'string') {
          console.error('❌ Authentication token missing');
          return next(new Error('Authentication token missing'));
        }

        // Проверяем JWT токен
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const decoded = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });

        const payload: JwtPayload = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          sub: decoded.sub,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          email: decoded.email,
        };

        console.log('✅ Token verified, payload:', payload);

        // Получаем данные пользователя
        const authService = this.app.get(AuthService);
        const user = await authService.validateUser(payload.sub);

        console.log('✅ User validated:', user.id);

        // Сохраняем пользователя в socket data
        socket.data.user = user;

        next();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ WebSocket auth error:', errorMessage);
        next(new Error('Authentication failed'));
      }
    };

    // Применяем middleware к основному namespace
    server.use(authMiddleware);

    // Применяем middleware ко всем namespaces (включая /messages)
    server.of(/.*/).use(authMiddleware);

    return server;
  }
}

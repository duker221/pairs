import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WebSocketExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WebSocketExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    let error: { message: string; status?: string };

    if (exception instanceof WsException) {
      error = {
        message: exception.message,
        status: 'error',
      };
    } else if (exception instanceof Error) {
      error = {
        message: exception.message,
        status: 'error',
      };
    } else {
      error = {
        message: 'Unknown error occurred',
        status: 'error',
      };
    }

    this.logger.error(`WebSocket error: ${error.message}`, exception);

    // Отправляем ошибку клиенту
    client.emit('error', error);
  }
}

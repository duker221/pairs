import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UsePipes, ValidationPipe, Logger, UseFilters } from '@nestjs/common';
import { CreateMessageDto } from './dto/message.dto';
import { MessageService } from './message.service';
import type { AuthenticatedSocket } from './types/socket.types';
import { WebSocketExceptionFilter } from './filters/ws-exception.filter';

@UseFilters(WebSocketExceptionFilter)
@WebSocketGateway({
  namespace: '/messages',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessageGateway.name);

  constructor(private messageService: MessageService) {}

  handleConnection(client: AuthenticatedSocket) {
    const userId = client.data.user?.id;
    this.logger.log(`Client connected: ${client.id}, User ID: ${userId}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.user?.id;
    this.logger.log(`Client disconnected: ${client.id}, User ID: ${userId}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: AuthenticatedSocket, coupleQuestionId: number) {
    await client.join(`question_${coupleQuestionId}`);
    const userId = client.data.user?.id;
    this.logger.log(`User ${userId} joined room: question_${coupleQuestionId}`);
    console.log('client connected to room');
    return { success: true };
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: AuthenticatedSocket, coupleQuestionId: number) {
    await client.leave(`question_${coupleQuestionId}`);
    const userId = client.data.user?.id;
    this.logger.log(`User ${userId} left room: question_${coupleQuestionId}`);
    return { success: true };
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @SubscribeMessage('message')
  async handleMessage(client: AuthenticatedSocket, payload: CreateMessageDto) {
    const userId = client.data.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    this.logger.log(
      `User ${userId} sending message to question ${payload.coupleQuestionId}`,
    );

    const message = await this.messageService.createMessage(userId, payload);

    // Broadcast to all clients in the room
    this.server
      .to(`question_${message.coupleQuestionId}`)
      .emit('message', message);

    return message;
  }
}

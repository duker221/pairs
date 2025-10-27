import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateMessageDto } from './dto/message.dto';
import { MessageService } from './message.service';
import type { AuthenticatedSocket } from './types/socket.types';

@WebSocketGateway({
  namespace: '/messages',
  cors: {
    origin: '*', // В проде укажите конкретный домен приложения
    credentials: true,
  },
})
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  constructor(private messageService: MessageService) {}

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: AuthenticatedSocket, coupleQuestionId: number) {
    await client.join(`question_${coupleQuestionId}`);
    console.log('Joined room:', `question_${coupleQuestionId}`);
    return { success: true };
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: AuthenticatedSocket, coupleQuestionId: number) {
    await client.leave(`question_${coupleQuestionId}`);
    console.log('Left room:', `question_${coupleQuestionId}`);
    return { success: true };
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @SubscribeMessage('message')
  async handleMessage(client: AuthenticatedSocket, payload: CreateMessageDto) {
    console.log('Received payload:', payload);

    const userId = client.data.user?.id ?? 1;
    console.log('Using userId:', userId);

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const message = await this.messageService.createMessage(userId, payload);
    console.log('✅ Message created:', message);

    this.server
      .to(`question_${message.coupleQuestionId}`)
      .emit('message', message);

    return message;
  }
}

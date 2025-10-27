import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dto/message.dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async createMessage(userId: number, createMessageDto: CreateMessageDto) {
    const coupleQuestion = await this.prisma.coupleQuestion.findUnique({
      where: { id: createMessageDto.coupleQuestionId },
      include: {
        couple: {
          include: {
            users: true,
          },
        },
        answers: true,
      },
    });

    if (!coupleQuestion) {
      throw new NotFoundException('Question not found');
    }

    const userInCouple = coupleQuestion.couple.users.find(
      (u) => u.id === userId,
    );

    if (!userInCouple) {
      throw new NotFoundException('You are not part of this couple');
    }

    if (coupleQuestion.answers.length < 2) {
      throw new NotFoundException(
        'Both partners must answer before discussing',
      );
    }

    return this.prisma.message.create({
      data: {
        userId,
        coupleQuestionId: createMessageDto.coupleQuestionId,
        text: createMessageDto.text,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getMessages(userId: number, coupleQuestionId: number) {
    const coupleQuestion = await this.prisma.coupleQuestion.findUnique({
      where: { id: coupleQuestionId },
      include: {
        couple: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!coupleQuestion) {
      throw new NotFoundException('Question not found');
    }

    const userInCouple = coupleQuestion.couple.users.find(
      (u) => u.id === userId,
    );

    if (!userInCouple) {
      throw new NotFoundException('You are not part of this couple');
    }

    return this.prisma.message.findMany({
      where: { coupleQuestionId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteMessage(userId: number, messageId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.userId !== userId) {
      throw new NotFoundException('You can only delete your own messages');
    }

    return this.prisma.message.delete({
      where: { id: messageId },
    });
  }
}

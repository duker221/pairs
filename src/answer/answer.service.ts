import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnswerDto } from './dto/answer.dto';

@Injectable()
export class AnswerService {
  constructor(private prisma: PrismaService) {}

  async createAnswer(userId: number, createAnswerDto: CreateAnswerDto) {
    const existingAnswer = await this.prisma.answer.findUnique({
      where: {
        userId_coupleQuestionId: {
          userId,
          coupleQuestionId: createAnswerDto.coupleQuestionId,
        },
      },
    });

    if (existingAnswer) {
      throw new ConflictException('Answer already exists');
    }

    const answer = await this.prisma.answer.create({
      data: {
        userId,
        coupleQuestionId: createAnswerDto.coupleQuestionId,
        textValue: createAnswerDto.textValue,
        scaleValue: createAnswerDto.scaleValue,
        choiceValue: createAnswerDto.choiceValue,
      },
    });

    const allAnswers = await this.prisma.answer.findMany({
      where: {
        coupleQuestionId: createAnswerDto.coupleQuestionId,
      },
    });

    const bothAnswered = allAnswers.length === 2;

    return {
      answer,
      bothAnswered,
      message: bothAnswered
        ? 'Both users have answered the question'
        : 'Only one user has answered the question',
    };
  }

  async getAnswers(userId: number, coupleQuestionId: number) {
    const myAnswer = await this.prisma.answer.findUnique({
      where: {
        userId_coupleQuestionId: {
          userId,
          coupleQuestionId,
        },
      },
    });

    if (!myAnswer) {
      throw new NotFoundException(
        'You need to answer first before seeing answers',
      );
    }

    // 2. Получаем все ответы на этот вопрос (свой + партнёра)
    const allAnswers = await this.prisma.answer.findMany({
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
    });

    const coupleQuestion = await this.prisma.coupleQuestion.findUnique({
      where: { id: coupleQuestionId },
      include: {
        question: true,
      },
    });

    return {
      question: coupleQuestion?.question,
      answers: allAnswers,
      bothAnswered: allAnswers.length === 2,
    };
  }
}

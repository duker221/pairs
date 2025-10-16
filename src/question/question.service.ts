import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async createQuestion(createQuestionDto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: createQuestionDto,
    });
  }

  async getQuestions() {
    return this.prisma.question.findMany();
  }

  async getQuestion(id: number) {
    return this.prisma.question.findUnique({
      where: { id },
    });
  }

  async updateQuestion(id: number, updateQuestionDto: UpdateQuestionDto) {
    return this.prisma.question.update({
      where: { id },
      data: updateQuestionDto,
    });
  }

  async getCoupleHistory(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { couple: true },
    });

    if (!user?.couple) {
      throw new NotFoundException('User is not in a couple');
    }

    const coupleQuestions = await this.prisma.coupleQuestion.findMany({
      where: { coupleId: user.couple.id },
      include: {
        question: true,
        answers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    });

    return coupleQuestions.map((cq) => ({
      coupleQuestionId: cq.id,
      sentAt: cq.sentAt,
      question: cq.question,
      bothAnswered: cq.answers.length === 2,
      answers: cq.answers.length === 2 ? cq.answers : [],
    }));
  }

  async getTodayQuestion(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        couple: true,
      },
    });

    if (!user?.couple) {
      throw new NotFoundException('User is not in a couple');
    }

    const coupleId = user.couple.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let coupleQuestion = await this.prisma.coupleQuestion.findFirst({
      where: {
        coupleId,
        sentAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        question: true,
        answers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    if (!coupleQuestion) {
      const usedQuestionIds = await this.prisma.coupleQuestion
        .findMany({
          where: { coupleId },
          select: { questionId: true },
        })
        .then((cq) => cq.map((q) => q.questionId));

      const availableQuestion = await this.prisma.question.findFirst({
        where: {
          id: { notIn: usedQuestionIds },
          isActive: true,
        },
        orderBy: {
          id: 'asc',
        },
      });

      if (!availableQuestion) {
        throw new NotFoundException('No more questions available');
      }

      coupleQuestion = await this.prisma.coupleQuestion.create({
        data: {
          coupleId,
          questionId: availableQuestion.id,
          sentAt: new Date(),
        },
        include: {
          question: true,
          answers: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });
    }

    const userAnswer = coupleQuestion.answers.find((a) => a.userId === userId);
    const partnerAnswer = coupleQuestion.answers.find(
      (a) => a.userId !== userId,
    );

    return {
      coupleQuestionId: coupleQuestion.id,
      question: coupleQuestion.question,
      userAnswered: !!userAnswer,
      partnerAnswered: !!partnerAnswer,
      bothAnswered: coupleQuestion.answers.length === 2,
      answers:
        coupleQuestion.answers.length === 2
          ? coupleQuestion.answers
          : undefined,
    };
  }
}

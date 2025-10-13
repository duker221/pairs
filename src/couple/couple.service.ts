import { PrismaService } from 'src/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateCoupleDto,
  JoinCoupleDto,
  UpdateCoupleDto,
} from './dto/couple.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class CoupleService {
  constructor(private prisma: PrismaService) {}

  async createCouple(userId: number, createCoupleDto: CreateCoupleDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user?.coupleId) {
      throw new ConflictException('User is already in a couple');
    }

    const couple = await this.prisma.couple.create({
      data: {
        inviteCode: await this.generateUniqueInviteCode(),
        relationStart: createCoupleDto.relationStart
          ? new Date(createCoupleDto.relationStart)
          : null,
        notificationTime: createCoupleDto.notificationTime || '20:00',
        relationType: createCoupleDto.relationType,
        users: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
    return couple;
  }

  async joinCouple(userId: number, joinCoupleDto: JoinCoupleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        couple: {
          include: { users: true },
        },
      },
    });

    if (user?.coupleId) {
      if (user?.couple?.users.length === 1) {
        await this.prisma.couple.delete({
          where: { id: user.coupleId },
        });
      } else {
        throw new ConflictException('You are already in a couple with someone');
      }
    }

    const couple = await this.prisma.couple.findUnique({
      where: { inviteCode: joinCoupleDto.inviteCode },
      include: { users: true },
    });

    if (!couple) {
      throw new NotFoundException('Couple not found');
    }

    if (couple.users.length >= 2) {
      throw new ConflictException('Couple is full');
    }

    const updatedCouple = await this.prisma.couple.update({
      where: { id: couple.id },
      data: {
        users: {
          connect: { id: userId },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    return updatedCouple;
  }

  async getMyCouple(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        couple: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!user?.couple) {
      throw new NotFoundException('You are not in a couple');
    }

    return user.couple;
  }

  async updateCouple(userId: number, updateCoupleDto: UpdateCoupleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { couple: true },
    });

    if (!user?.couple) {
      throw new NotFoundException('You are not in a couple');
    }

    const updatedCouple = await this.prisma.couple.update({
      where: { id: user.coupleId! },
      data: {
        relationStart: updateCoupleDto.relationStart
          ? new Date(updateCoupleDto.relationStart)
          : undefined,
        notificationTime: updateCoupleDto.notificationTime,
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    return updatedCouple;
  }

  async leave(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        couple: {
          include: { users: true },
        },
      },
    });

    if (!user?.couple) {
      throw new NotFoundException('You are not in a couple');
    }

    if (user.couple.users.length === 1) {
      await this.prisma.couple.delete({
        where: { id: user.coupleId! },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: { coupleId: null },
      });
    }
  }

  private async generateUniqueInviteCode(): Promise<string> {
    let code: string;
    let exists = true;

    do {
      code = randomUUID().replace(/-/g, '').substring(0, 6).toUpperCase();
      const found = await this.prisma.couple.findUnique({
        where: { inviteCode: code },
      });
      exists = !!found;
    } while (exists);

    return code;
  }
}

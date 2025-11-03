import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendNotificationDto } from './dto/SendNotification.dto';
import { NotificationResponse, NotificationStatus } from './types/types';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly expo: Expo;

  constructor(private readonly prisma: PrismaService) {
    this.expo = new Expo();
  }

  async sendNotification(
    userId: number,
    sendNotificationDto: SendNotificationDto,
  ): Promise<NotificationResponse> {
    try {
      // Get user with push token
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, expoPushToken: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.expoPushToken) {
        this.logger.warn(`User ${userId} has no push token`);
        return {
          message: 'User has no push token registered',
          status: NotificationStatus.ERROR,
        };
      }

      if (!Expo.isExpoPushToken(user.expoPushToken)) {
        this.logger.error(`Invalid push token for user ${userId}`);
        return {
          message: 'Invalid push token format',
          status: NotificationStatus.ERROR,
        };
      }

      const message: ExpoPushMessage = {
        to: user.expoPushToken,
        sound: 'default',
        title: sendNotificationDto.title,
        body: sendNotificationDto.body,
        data: sendNotificationDto.data,
      };

      const chunks = this.expo.chunkPushNotifications([message]);
      await this.expo.sendPushNotificationsAsync(chunks[0]);

      this.logger.log(`Notification sent to user ${userId} (${user.username})`);

      return {
        message: 'Notification sent successfully',
        status: NotificationStatus.SUCCESS,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send notification: ${errorMessage}`);

      return {
        message: 'Failed to send notification',
        status: NotificationStatus.ERROR,
        error: errorMessage,
      };
    }
  }
}

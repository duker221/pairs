import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CoupleModule } from './couple/couple.module';
import { QuestionModule } from './question/question.module';
import { PrismaModule } from './prisma/prisma.module';
import { AnswerModule } from './answer/answer.module';
import { MessageModule } from './message/message.module';
import { NotificationsModule } from './notification/notifications.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CoupleModule,
    QuestionModule,
    PrismaModule,
    AnswerModule,
    MessageModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

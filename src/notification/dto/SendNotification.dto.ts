import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty({ example: 'Новый вопрос дня! ❤️' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Какое ваше любимое совместное воспоминание?' })
  @IsString()
  body: string;

  @ApiPropertyOptional({
    example: {
      type: 'NEW_QUESTION',
      coupleQuestionId: 123,
      screen: 'TodayQuestion',
    },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

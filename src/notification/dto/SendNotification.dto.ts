import { IsNumber, IsString } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsNumber()
  userId: number;
}

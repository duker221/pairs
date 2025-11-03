import { IsString } from 'class-validator';

export class RegisterPushTokenDto {
  @IsString()
  expoPushToken: string;
}

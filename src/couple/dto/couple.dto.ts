import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { RelationType } from '@prisma/client';

export class CreateCoupleDto {
  @IsDateString()
  @IsOptional()
  relationStart: string;

  @IsString()
  @IsOptional()
  notificationTime: string;

  @IsEnum(RelationType)
  @IsOptional()
  relationType: RelationType;
}

export class JoinCoupleDto {
  @IsString()
  inviteCode: string;
}

export class UpdateCoupleDto {
  @IsDateString()
  @IsOptional()
  relationStart?: string;

  @IsString()
  @IsOptional()
  notificationTime?: string;
}

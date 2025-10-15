import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { RelationType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCoupleDto {
  @ApiProperty({
    example: '2023-01-15T00:00:00.000Z',
    description: 'Relationship start date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  relationStart: string;

  @ApiProperty({
    example: '20:00',
    description: 'Daily notification time (HH:mm format)',
    required: false,
  })
  @IsString()
  @IsOptional()
  notificationTime: string;

  @ApiProperty({
    enum: RelationType,
    example: 'DATING',
    description: 'Type of relationship',
    required: false,
  })
  @IsEnum(RelationType)
  @IsOptional()
  relationType: RelationType;
}

export class JoinCoupleDto {
  @ApiProperty({
    example: 'ABC123',
    description: 'Invite code to join couple',
  })
  @IsString()
  inviteCode: string;
}

export class UpdateCoupleDto {
  @ApiProperty({
    example: '2023-01-15T00:00:00.000Z',
    description: 'Relationship start date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  relationStart?: string;

  @ApiProperty({
    example: '20:00',
    description: 'Daily notification time (HH:mm format)',
    required: false,
  })
  @IsString()
  @IsOptional()
  notificationTime?: string;
}

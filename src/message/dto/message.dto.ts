import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the couple question to comment on',
  })
  @IsInt()
  coupleQuestionId: number;

  @ApiProperty({
    example: 'I love your answer! Let me tell you more...',
    description: 'Message text',
  })
  @IsString()
  text: string;
}

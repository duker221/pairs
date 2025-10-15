import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the couple question being answered',
  })
  @IsInt()
  coupleQuestionId: number;

  @ApiProperty({
    example: 'This is my detailed text answer',
    description: 'Text answer for TEXT type questions',
    required: false,
  })
  @IsString()
  @IsOptional()
  textValue: string;

  @ApiProperty({
    example: 8,
    description: 'Scale value (1-10) for SCALE type questions',
    required: false,
  })
  @IsInt()
  @IsOptional()
  scaleValue?: number;

  @ApiProperty({
    example: 'Option1',
    description: 'Selected choice for CHOICE type questions',
    required: false,
  })
  @IsString()
  @IsOptional()
  choiceValue?: string;
}

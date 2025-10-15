import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { AnswerType, Category } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({
    example: 'What is your favorite memory together?',
    description: 'Question text',
  })
  @IsString()
  text: string;

  @ApiProperty({
    enum: Category,
    example: 'RELATIONSHIP',
    description: 'Question category',
  })
  @IsEnum(Category)
  category: Category;

  @ApiProperty({
    enum: AnswerType,
    example: 'TEXT',
    description: 'Type of answer expected (TEXT, SCALE, CHOICE)',
  })
  @IsEnum(AnswerType)
  answerType: AnswerType;

  @ApiProperty({
    example: true,
    description: 'Whether question is active',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @ApiProperty({
    example: 'Option1,Option2,Option3',
    description: 'Comma-separated options for CHOICE type questions',
    required: false,
  })
  @IsString()
  @IsOptional()
  options: string;
}

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}

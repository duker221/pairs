import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { AnswerType, Category } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsEnum(Category)
  category: Category;

  @IsEnum(AnswerType)
  answerType: AnswerType;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsString()
  @IsOptional()
  options: string;
}

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}

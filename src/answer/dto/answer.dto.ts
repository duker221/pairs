import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsInt()
  coupleQuestionId: number;

  @IsString()
  @IsOptional()
  textValue: string;

  @IsInt()
  @IsOptional()
  scaleValue?: number;

  @IsString()
  @IsOptional()
  choiceValue?: string;
}

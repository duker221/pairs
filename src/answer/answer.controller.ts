import {
  Controller,
  Get,
  ParseIntPipe,
  Post,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { Body } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateAnswerDto } from './dto/answer.dto';
import { AnswerService } from './answer.service';
import { UserResponse } from 'src/auth/types/auth-response.types';

@Controller('answers')
@UseGuards(JwtGuard)
export class AnswerController {
  constructor(private answerService: AnswerService) {}

  @Post()
  async createAnswer(
    @Request() req: Request & { user: UserResponse },
    @Body() createAnswerDto: CreateAnswerDto,
  ) {
    return this.answerService.createAnswer(req.user.id, createAnswerDto);
  }

  @Get(':coupleQuestionId')
  async getAnswers(
    @Request() req: Request & { user: UserResponse },
    @Param('coupleQuestionId', ParseIntPipe) coupleQuestionId: number,
  ) {
    return this.answerService.getAnswers(req.user.id, coupleQuestionId);
  }
}

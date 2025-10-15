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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateAnswerDto } from './dto/answer.dto';
import { AnswerService } from './answer.service';
import { UserResponse } from 'src/auth/types/auth-response.types';

@ApiTags('Answers')
@ApiBearerAuth()
@Controller('answers')
@UseGuards(JwtGuard)
export class AnswerController {
  constructor(private answerService: AnswerService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an answer to a question' })
  @ApiResponse({
    status: 201,
    description: 'Answer submitted successfully',
    schema: {
      example: {
        id: 1,
        userId: 1,
        coupleQuestionId: 1,
        text: 'My answer text',
        createdAt: '2025-10-14T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async createAnswer(
    @Request() req: Request & { user: UserResponse },
    @Body() createAnswerDto: CreateAnswerDto,
  ) {
    return this.answerService.createAnswer(req.user.id, createAnswerDto);
  }

  @Get(':coupleQuestionId')
  @ApiOperation({ summary: 'Get answers for a specific couple question' })
  @ApiParam({
    name: 'coupleQuestionId',
    description: 'Couple Question ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns answers from both partners',
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async getAnswers(
    @Request() req: Request & { user: UserResponse },
    @Param('coupleQuestionId', ParseIntPipe) coupleQuestionId: number,
  ) {
    return this.answerService.getAnswers(req.user.id, coupleQuestionId);
  }
}

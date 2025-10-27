import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { QuestionService } from './question.service';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';
import { UserResponse } from 'src/auth/types/auth-response.types';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('Questions')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('questions')
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new question' })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionService.createQuestion(createQuestionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all questions' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all questions',
  })
  getQuestions() {
    return this.questionService.getQuestions();
  }

  @Get('couple/feed')
  @ApiOperation({ summary: 'Get couple questions feed with last messages' })
  @ApiResponse({
    status: 200,
    description: 'Returns all couple questions with last message preview',
    schema: {
      example: {
        questions: [
          {
            id: 1,
            sentAt: '2025-10-15T00:00:00Z',
            question: {
              text: 'What is your favorite memory together?',
              category: 'GENERAL',
              answerType: 'TEXT',
            },
            lastMessage: {
              text: 'Our trip to mountains was amazing!',
              user: { username: 'duker22', avatar: null },
              createdAt: '2025-10-15T18:00:00Z',
            },
            bothAnswered: true,
            messagesCount: 5,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User is not in a couple' })
  async getCoupleFeed(@Request() req: Request & { user: UserResponse }) {
    return await this.questionService.getCoupleFeed(req.user.id);
  }

  @Get('couple/history')
  @ApiOperation({ summary: 'Get couple question history' })
  @ApiResponse({
    status: 200,
    description: 'Returns all past questions with answers for the couple',
  })
  @ApiResponse({ status: 404, description: 'User is not in a couple' })
  async getCoupleHistory(@Request() req: Request & { user: UserResponse }) {
    return await this.questionService.getCoupleHistory(req.user.id);
  }

  @Get('today')
  @ApiOperation({ summary: "Get today's question for current couple" })
  @ApiResponse({
    status: 200,
    description: "Returns today's question with answers",
    schema: {
      example: {
        coupleQuestionId: 1,
        question: {
          id: 1,
          text: 'What is your favorite memory together?',
          category: 'GENERAL',
          answerType: 'TEXT',
        },
        userAnswered: true,
        partnerAnswered: true,
        bothAnswered: true,
        answers: [
          {
            id: 1,
            userId: 1,
            textValue: 'Our trip to Paris',
            user: { id: 1, username: 'duker22', avatar: null },
          },
          {
            id: 2,
            userId: 3,
            textValue: 'Our first date',
            user: { id: 3, username: 'Example 2', avatar: null },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User is not in a couple' })
  async getTodayQuestion(@Request() req: Request & { user: UserResponse }) {
    console.log('User:', req.user);
    return this.questionService.getTodayQuestion(req.user.id);
  }

  @Get('couple/:coupleQuestionId')
  @ApiOperation({ summary: 'Get specific couple question by ID' })
  @ApiParam({
    name: 'coupleQuestionId',
    description: 'Couple Question ID',
    type: Number,
  })
  async getCoupleQuestion(
    @Request() req: Request & { user: UserResponse },
    @Param('coupleQuestionId', ParseIntPipe) coupleQuestionId: number,
  ) {
    return this.questionService.getCoupleQuestion(
      req.user.id,
      coupleQuestionId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get question by ID' })
  @ApiParam({ name: 'id', description: 'Question ID', type: Number })
  @ApiResponse({ status: 200, description: 'Returns question details' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  getQuestionById(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.getQuestion(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update question' })
  @ApiParam({ name: 'id', description: 'Question ID', type: Number })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionService.updateQuestion(id, updateQuestionDto);
  }
}

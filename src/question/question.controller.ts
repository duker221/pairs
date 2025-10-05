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
import { QuestionService } from './question.service';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';
import { UserResponse } from 'src/auth/types/auth-response.types';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('questions')
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Post()
  createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionService.createQuestion(createQuestionDto);
  }

  @Get()
  getQuestions() {
    return this.questionService.getQuestions();
  }

  @Get('today')
  async getTodayQuestion(@Request() req: Request & { user: UserResponse }) {
    console.log('User:', req.user);
    return this.questionService.getTodayQuestion(req.user.id);
  }

  @Get(':id')
  getQuestionById(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.getQuestion(id);
  }

  @Patch(':id')
  updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionService.updateQuestion(id, updateQuestionDto);
  }
}

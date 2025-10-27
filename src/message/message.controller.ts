import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/message.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserResponse } from 'src/auth/types/auth-response.types';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
@UseGuards(JwtGuard)
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a message for a couple question' })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully',
    schema: {
      example: {
        id: 1,
        userId: 1,
        coupleQuestionId: 1,
        text: 'Great answer! Let me add...',
        createdAt: '2025-10-15T18:00:00.000Z',
        user: {
          id: 1,
          username: 'duker22',
          avatar: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Both partners must answer before discussing',
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async createMessage(
    @Request() req: Request & { user: UserResponse },
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return await this.messageService.createMessage(
      req.user.id,
      createMessageDto,
    );
  }

  @Get('question/:coupleQuestionId')
  @ApiOperation({ summary: 'Get all messages for a couple question' })
  @ApiParam({
    name: 'coupleQuestionId',
    description: 'Couple Question ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all messages for the question',
    schema: {
      example: [
        {
          id: 1,
          userId: 1,
          coupleQuestionId: 1,
          text: 'I loved your answer!',
          createdAt: '2025-10-15T18:00:00Z',
          user: { id: 1, username: 'duker22', avatar: null },
        },
        {
          id: 2,
          userId: 3,
          coupleQuestionId: 1,
          text: 'Thanks! Your answer was great too',
          createdAt: '2025-10-15T18:05:00Z',
          user: { id: 3, username: 'Example 2', avatar: null },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async getMessages(
    @Request() req: Request & { user: UserResponse },
    @Param('coupleQuestionId', ParseIntPipe) coupleQuestionId: number,
  ) {
    return await this.messageService.getMessages(req.user.id, coupleQuestionId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiParam({ name: 'id', description: 'Message ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Message deleted successfully',
    schema: {
      example: {
        id: 1,
        userId: 1,
        coupleQuestionId: 1,
        text: 'Deleted message',
        createdAt: '2025-10-15T18:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async deleteMessage(
    @Request() req: Request & { user: UserResponse },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.messageService.deleteMessage(req.user.id, id);
  }
}

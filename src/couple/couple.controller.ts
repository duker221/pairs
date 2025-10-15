import { UserResponse } from './../auth/types/auth-response.types';
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CoupleService } from './couple.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import {
  CreateCoupleDto,
  JoinCoupleDto,
  UpdateCoupleDto,
} from './dto/couple.dto';

@ApiTags('Couples')
@ApiBearerAuth()
@Controller('couple')
@UseGuards(JwtGuard)
export class CoupleController {
  constructor(private coupleService: CoupleService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new couple' })
  @ApiResponse({
    status: 201,
    description: 'Couple created successfully',
    schema: {
      example: {
        id: 1,
        inviteCode: 'ABC123',
        relationshipType: 'DATING',
        user1Id: 1,
        user2Id: null,
        createdAt: '2025-10-14T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'User already in a couple' })
  async createCouple(
    @Request() req: Request & { user: UserResponse },
    @Body() createCoupleDto: CreateCoupleDto,
  ) {
    return this.coupleService.createCouple(req.user.id, createCoupleDto);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join existing couple by invite code' })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined couple',
  })
  @ApiResponse({ status: 404, description: 'Couple not found' })
  @ApiResponse({
    status: 400,
    description: 'User already in a couple or couple is full',
  })
  async joinCouple(
    @Request() req: Request & { user: UserResponse },
    @Body() joinCoupleDto: JoinCoupleDto,
  ) {
    return this.coupleService.joinCouple(req.user.id, joinCoupleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user couple information' })
  @ApiResponse({
    status: 200,
    description: 'Returns couple data with both users',
  })
  @ApiResponse({ status: 404, description: 'User is not in any couple' })
  async getMyCouple(@Request() req: Request & { user: UserResponse }) {
    return this.coupleService.getMyCouple(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update couple information' })
  @ApiResponse({
    status: 200,
    description: 'Couple updated successfully',
  })
  @ApiResponse({ status: 404, description: 'User is not in any couple' })
  async updateCouple(
    @Request() req: Request & { user: UserResponse },
    @Body() updateCoupleDto: UpdateCoupleDto,
  ) {
    return this.coupleService.updateCouple(req.user.id, updateCoupleDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Leave current couple' })
  @ApiResponse({
    status: 200,
    description: 'Successfully left the couple',
  })
  @ApiResponse({ status: 404, description: 'User is not in any couple' })
  async leave(@Request() req: Request & { user: UserResponse }) {
    return this.coupleService.leave(req.user.id);
  }
}

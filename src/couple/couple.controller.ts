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
import { CoupleService } from './couple.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import {
  CreateCoupleDto,
  JoinCoupleDto,
  UpdateCoupleDto,
} from './dto/couple.dto';

@Controller('couple')
@UseGuards(JwtGuard)
export class CoupleController {
  constructor(private coupleService: CoupleService) {}

  @Post('create')
  async createCouple(
    @Request() req: Request & { user: UserResponse },
    @Body() createCoupleDto: CreateCoupleDto,
  ) {
    return this.coupleService.createCouple(req.user.id, createCoupleDto);
  }

  @Post('join')
  async joinCouple(
    @Request() req: Request & { user: UserResponse },
    @Body() joinCoupleDto: JoinCoupleDto,
  ) {
    return this.coupleService.joinCouple(req.user.id, joinCoupleDto);
  }

  @Get()
  async getMyCouple(@Request() req: Request & { user: UserResponse }) {
    return this.coupleService.getMyCouple(req.user.id);
  }

  @Patch()
  async updateCouple(
    @Request() req: Request & { user: UserResponse },
    @Body() updateCoupleDto: UpdateCoupleDto,
  ) {
    return this.coupleService.updateCouple(req.user.id, updateCoupleDto);
  }

  @Delete()
  async leave(@Request() req: Request & { user: UserResponse }) {
    return this.coupleService.leave(req.user.id);
  }
}

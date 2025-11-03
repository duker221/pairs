import { Body, Controller, Get, Post, Delete, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all users',
    schema: {
      example: [
        {
          id: 1,
          email: 'user@example.com',
          username: 'johndoe',
          createdAt: '2025-10-14T12:00:00.000Z',
        },
      ],
    },
  })
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post('push-token')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register Expo push notification token' })
  @ApiResponse({
    status: 200,
    description: 'Push token registered successfully',
  })
  async registerUserPushToken(
    @CurrentUser('id') userId: number,
    @Body() registerPushTokenDto: RegisterPushTokenDto,
  ) {
    return this.userService.updateUserPushToken(
      userId,
      registerPushTokenDto.expoPushToken,
    );
  }

  @Delete('push-token')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove push notification token' })
  @ApiResponse({
    status: 200,
    description: 'Push token removed successfully',
  })
  async deleteUserPushToken(@CurrentUser('id') userId: number) {
    return this.userService.deleteUserPushToken(userId);
  }
}

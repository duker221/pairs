import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';

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
}

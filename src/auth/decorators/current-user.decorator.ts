import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponse } from '../types/auth-response.types';

interface RequestWithUser {
  user: UserResponse;
}

export const CurrentUser = createParamDecorator(
  <K extends keyof UserResponse>(
    data: K | undefined,
    ctx: ExecutionContext,
  ): UserResponse | UserResponse[K] => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // If a specific field is requested, return only that field
    return data ? user[data] : user;
  },
);

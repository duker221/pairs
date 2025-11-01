import { Prisma, User } from '@prisma/client';

export type UserResponse = Omit<User, 'password'>;

export interface AuthResponse {
  message: string;
  user: UserResponse;
  access_token: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  iat?: number;
  exp?: number;
}

export type UserWithRelations = Prisma.UserGetPayload<{
  include: { answers: true };
}>;

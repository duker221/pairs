import { User } from '@prisma/client';

export type UserResponse = Omit<User, 'password'>;

export interface AuthResponse {
  message: string;
  user: UserResponse;
  access_token: string;
}

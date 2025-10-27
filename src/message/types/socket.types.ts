import { Socket } from 'socket.io';
import { UserResponse } from 'src/auth/types/auth-response.types';

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: UserResponse;
  };
}

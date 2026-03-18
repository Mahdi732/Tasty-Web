import { io } from 'socket.io-client';
import { env } from '@/shared/config/env';

export const connectNotificationSocket = (userId: string) =>
  io(env.gatewayUrl, {
    path: '/socket.io',
    auth: { userId },
    transports: ['websocket'],
  });

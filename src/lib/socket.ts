import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://localhost';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;

    // Establish WebSocket connection via the API Gateway
    const socket = io(GATEWAY_URL, {
      auth: { token },
      transports: ['websocket'],
      secure: true,
      rejectUnauthorized: false // Handle DEV self-signed certs
    });

    socket.on('connect', () => {
      console.log(`[Socket] Connected to Notification Service: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected from Notification Service`);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return socketRef;
};

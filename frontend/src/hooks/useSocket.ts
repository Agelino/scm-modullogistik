import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const subscribe = useCallback((event: string, callback: (data: unknown) => void) => {
    socketRef.current?.on(event, callback);
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  const emit = useCallback((event: string, data: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const joinRoom = useCallback((room: string) => {
    socketRef.current?.emit('tracking:subscribe', { deliveryPlanId: room });
  }, []);

  const joinMonitoring = useCallback(() => {
    socketRef.current?.emit('monitoring:subscribe');
  }, []);

  return { socket: socketRef.current, subscribe, emit, joinRoom, joinMonitoring };
}

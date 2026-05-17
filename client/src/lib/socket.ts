import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  const url = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  socket = io(url, { auth: { token } });

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;

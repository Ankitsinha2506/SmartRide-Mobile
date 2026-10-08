import { io } from 'socket.io-client';
import { env } from '../config/env';
let socket;
export function connectRealtime(token, onNotification) {
  socket?.disconnect();
  socket = io(env.socketUrl, { auth: { token }, transports: ['websocket'] });
  socket.on('notification:new', onNotification);
  return () => socket?.disconnect();
}

import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => socket;

/**
 * Initialize Socket.IO connection.
 * The token is passed explicitly because Socket.IO handshake
 * cannot access httpOnly cookies directly. The server returns
 * the token in the response body specifically for this purpose.
 * The backend socket middleware verifies this token normally.
 *
 * @param {string} token - JWT from auth response body
 */
export const initSocket = (token) => {
  if (socket) socket.disconnect();

  socket = io('/', {
    auth: { token }, // Token from server response body (for socket handshake only)
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected');
  });

  socket.on('connect_error', (err) => {
    console.warn('⚠️ Socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
    // Auto-reconnect for transport issues (not manual disconnects)
    if (reason === 'io server disconnect') {
      socket.connect();
    }
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { getSocket, initSocket, disconnectSocket };

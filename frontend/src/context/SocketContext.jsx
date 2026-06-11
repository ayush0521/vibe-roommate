import { createContext, useContext, useEffect, useState } from 'react';
import { getSocket } from '../socket/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    if (!isAuthenticated) { setSocket(null); return; }
    const s = getSocket();
    if (!s) return;
    setSocket(s);

    s.emit('join_notifications');

    s.on('user_online', ({ userId }) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: true }));
    });
    s.on('user_offline', ({ userId }) => {
      setOnlineUsers((prev) => { const n = { ...prev }; delete n[userId]; return n; });
    });
    s.on('online_statuses', (statuses) => {
      setOnlineUsers((prev) => ({ ...prev, ...statuses }));
    });

    return () => {
      s.off('user_online');
      s.off('user_offline');
      s.off('online_statuses');
    };
  }, [isAuthenticated]);

  const isOnline = (userId) => !!onlineUsers[userId?.toString()];

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be inside SocketProvider');
  return ctx;
};

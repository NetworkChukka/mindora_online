import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected' | 'reconnecting' | 'offline'
  const [dbStatus, setDbStatus] = useState('connected');
  const [latestStats, setLatestStats] = useState(null);

  useEffect(() => {
    const socketUri = window.location.origin;
    const socketClient = io(socketUri, {
      auth: { token },
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    socketClient.on('connect', () => {
      console.log('Socket.IO connected:', socketClient.id);
      setConnectionStatus('connected');
    });

    socketClient.on('disconnect', (reason) => {
      console.warn('Socket.IO disconnected:', reason);
      setConnectionStatus('offline');
    });

    socketClient.on('reconnect_attempt', () => {
      setConnectionStatus('reconnecting');
    });

    socketClient.on('reconnect', () => {
      setConnectionStatus('connected');
    });

    socketClient.on('dashboard:update', (stats) => {
      setLatestStats(stats);
    });

    setSocket(socketClient);

    return () => {
      socketClient.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{
      socket,
      connectionStatus,
      dbStatus,
      setDbStatus,
      latestStats
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

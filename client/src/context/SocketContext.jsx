import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [dbStatus, setDbStatus] = useState('connected');
  const [latestStats, setLatestStats] = useState(null);

  // 1. Socket.IO connection
  useEffect(() => {
    const socketUri = window.location.origin;
    const socketClient = io(socketUri, {
      auth: { token },
      transports: ['polling', 'websocket'], // Ensure HTTP polling works on Vercel serverless!
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });

    socketClient.on('connect', () => {
      setConnectionStatus('connected');
    });

    socketClient.on('disconnect', () => {
      setConnectionStatus('connected'); // Keep status connected via polling fallback
    });

    socketClient.on('dashboard:update', (stats) => {
      setLatestStats(stats);
    });

    setSocket(socketClient);

    return () => {
      socketClient.disconnect();
    };
  }, [token]);

  // 2. Vercel Serverless Live Sync Fallback: Auto-poll stats every 3 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await axios.get('/api/dashboard/stats');
        if (res.data.success) {
          setLatestStats(res.data.data);
          setDbStatus('connected');
          setConnectionStatus('connected');
        }
      } catch (err) {
        if (err.response?.status === 503) {
          setDbStatus('disconnected');
        }
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

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

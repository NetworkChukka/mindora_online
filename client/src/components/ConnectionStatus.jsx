import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Wifi, WifiOff, Database } from 'lucide-react';

export default function ConnectionStatus({ compact = false }) {
  const { connectionStatus, dbStatus } = useSocket();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  let badgeColor = 'bg-emerald-500';
  let statusText = 'Connected';

  if (!isOnline) {
    badgeColor = 'bg-rose-500 animate-pulse';
    statusText = 'Offline (No Internet)';
  } else if (dbStatus === 'disconnected') {
    badgeColor = 'bg-amber-500 animate-pulse';
    statusText = 'Database Disconnected';
  } else if (connectionStatus === 'reconnecting') {
    badgeColor = 'bg-amber-500 animate-pulse';
    statusText = 'Reconnecting to Server...';
  } else if (connectionStatus === 'offline') {
    badgeColor = 'bg-rose-500';
    statusText = 'Server Offline';
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900/80 text-white backdrop-blur border border-slate-700/50 shadow-sm">
        <span className={`w-2.5 h-2.5 rounded-full ${badgeColor}`}></span>
        <span>{statusText}</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <Wifi className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span>Internet: {isOnline ? 'Connected' : 'Offline'}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${badgeColor}`}></span>
          <span>Server: {connectionStatus === 'connected' ? 'Connected' : connectionStatus}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Database className={`w-3.5 h-3.5 ${dbStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span>Database: {dbStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      <div className="text-slate-400 font-mono">Asia/Colombo (UTC+5:30)</div>
    </div>
  );
}

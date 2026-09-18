import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { BookOpen, GraduationCap } from 'lucide-react';

export default function DisplayPage() {
  const { socket, connectionStatus } = useSocket();
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalStudents: 0,
    totalTeachers: 0,
    olStudents: 0,
    alStudents: 0,
    totalSchools: 0,
    todaysRegistrations: 0,
    lastUpdated: new Date()
  });

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/dashboard/stats');
      if (res.data.success) {
        setStats({ ...res.data.data, lastUpdated: new Date() });
      }
    } catch (err) {
      console.error('Failed to load display stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    // Live Sync polling every 3 seconds for TV Display screen
    const interval = setInterval(() => {
      fetchStats();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Socket.IO event listener
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (newStats) => {
      setStats({ ...newStats, lastUpdated: new Date() });
    };
    socket.on('dashboard:update', handleUpdate);
    return () => socket.off('dashboard:update', handleUpdate);
  }, [socket]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 md:p-12 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Top TV Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-2 rounded-2xl shadow-2xl flex items-center h-16">
            <img
              src="/assets/mindora-logo.jpg"
              alt="MINDORA Logo"
              className="h-12 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-wider text-white">MINDORA</h1>
            <p className="text-xs md:text-sm text-emerald-400 font-bold tracking-[0.3em] uppercase mt-1">
              MICROBIOLOGY EXHIBITION • LIVE VISITOR DISPLAY
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-mono bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>LIVE SYNC</span>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">LAST UPDATED</div>
            <div className="text-sm font-mono font-bold text-slate-200">
              {new Date(stats.lastUpdated).toLocaleTimeString('en-LK', { timeZone: 'Asia/Colombo' })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero Visitors Counter */}
      <main className="my-8 space-y-12">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 p-8 md:p-12 rounded-[40px] shadow-2xl text-center relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>

          <div className="text-sm md:text-base font-extrabold uppercase tracking-[0.4em] text-slate-400 mb-2">
            TOTAL EXHIBITION VISITORS
          </div>

          <div className="text-7xl md:text-[140px] font-black tracking-tight text-white leading-none my-4">
            {stats.totalVisitors}
          </div>

          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-2 rounded-full font-bold text-sm md:text-base">
            <span>Today's Registrations: +{stats.todaysRegistrations}</span>
          </div>
        </div>

        {/* Breakdown Metric Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl text-center space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Students</span>
            </div>
            <div className="text-4xl md:text-6xl font-black text-white">{stats.totalStudents}</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl text-center space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Teachers</span>
            </div>
            <div className="text-4xl md:text-6xl font-black text-emerald-400">{stats.totalTeachers}</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl text-center space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
              <span className="text-blue-400 font-bold">O/L</span>
              <span>(Grades 6–11)</span>
            </div>
            <div className="text-4xl md:text-6xl font-black text-blue-400">{stats.olStudents}</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl text-center space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
              <span className="text-indigo-400 font-bold">A/L</span>
              <span>(Grades 12–13)</span>
            </div>
            <div className="text-4xl md:text-6xl font-black text-indigo-400">{stats.alStudents}</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-6 text-xs text-slate-500 font-mono">
        <div>MINDORA MICROBIOLOGY EXHIBITION SYSTEM • ONLINE REAL-TIME DISPLAY</div>
        <div>Active Participating Schools: <strong className="text-white">{stats.totalSchools}</strong></div>
      </footer>
    </div>
  );
}

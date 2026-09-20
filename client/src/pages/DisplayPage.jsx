import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { BookOpen, GraduationCap, PartyPopper, Sparkles, Trophy, X } from 'lucide-react';

export default function DisplayPage() {
  const { socket } = useSocket();
  const { isAdmin } = useAuth();
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

  // Milestone Celebration state
  const [activeMilestone, setActiveMilestone] = useState(null);
  const prevVisitorsRef = useRef(0);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/dashboard/stats');
      if (res.data.success) {
        const newTotal = res.data.data.totalVisitors;
        checkMilestone(newTotal, prevVisitorsRef.current);
        prevVisitorsRef.current = newTotal;
        setStats({ ...res.data.data, lastUpdated: new Date() });
      }
    } catch (err) {
      console.error('Failed to load display stats:', err);
    }
  };

  const triggerConfetti = () => {
    // Cannon burst 1
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    // Cannon burst 2 (delayed side bursts)
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 400);
  };

  const checkMilestone = (current, previous) => {
    if (current <= 0) return;
    const milestones = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000, 4000, 5000];
    
    // Find if a milestone was hit or crossed
    const hitMilestone = milestones.find(m => current >= m && previous < m);
    if (hitMilestone) {
      setActiveMilestone(hitMilestone);
      triggerConfetti();
    }
  };

  const triggerTestMilestone = (m = 100) => {
    setActiveMilestone(m);
    triggerConfetti();
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Socket.IO real-time listener
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (newStats) => {
      const newTotal = newStats.totalVisitors;
      checkMilestone(newTotal, prevVisitorsRef.current);
      prevVisitorsRef.current = newTotal;
      setStats({ ...newStats, lastUpdated: new Date() });
    };
    socket.on('dashboard:update', handleUpdate);
    return () => socket.off('dashboard:update', handleUpdate);
  }, [socket]);

  // Auto-dismiss milestone overlay after 9 seconds
  useEffect(() => {
    if (activeMilestone) {
      const timer = setTimeout(() => {
        setActiveMilestone(null);
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [activeMilestone]);

  return (
    <div className="min-h-screen text-white flex flex-col justify-between p-6 md:p-12 font-sans relative overflow-hidden bg-animated-gradient">
      {/* Dynamic Embedded CSS for Smooth Gradient Shift */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .bg-animated-gradient {
          background: linear-gradient(-45deg, #020617, #0f172a, #1e1b4b, #042f2e, #0f172a);
          background-size: 400% 400%;
          animation: gradientMove 16s ease infinite;
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* Top TV Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6 relative z-10">
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
          <div className="flex items-center space-x-2 text-xs font-mono bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-full">
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
      <main className="my-8 space-y-12 relative z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/90 p-8 md:p-12 rounded-[40px] shadow-2xl text-center relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-sm md:text-base font-extrabold uppercase tracking-[0.4em] text-slate-400 mb-2">
            TOTAL EXHIBITION VISITORS
          </div>

          <div className="text-7xl md:text-[150px] font-black tracking-tight text-white leading-none my-4 drop-shadow-lg">
            {stats.totalVisitors}
          </div>

          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-2 rounded-full font-bold text-sm md:text-base shadow-inner">
            <Sparkles className="w-4 h-4" />
            <span>Today's Registrations: +{stats.todaysRegistrations}</span>
          </div>
        </div>

        {/* Breakdown Metric Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 p-6 rounded-3xl text-center space-y-2 hover:border-blue-500/50 transition">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Students</span>
            </div>
            <div className="text-4xl md:text-6xl font-black text-white">{stats.totalStudents}</div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 p-6 rounded-3xl text-center space-y-2 hover:border-emerald-500/50 transition">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Teachers</span>
            </div>
            <div className="text-4xl md:text-6xl font-black text-emerald-400">{stats.totalTeachers}</div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 p-6 rounded-3xl text-center space-y-2 hover:border-blue-400/50 transition">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
              <span className="text-blue-400 font-bold">O/L</span>
              <span>(Grades 6–11)</span>
            </div>
            <div className="text-4xl md:text-6xl font-black text-blue-400">{stats.olStudents}</div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 p-6 rounded-3xl text-center space-y-2 hover:border-indigo-400/50 transition">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
              <span className="text-indigo-400 font-bold">A/L</span>
              <span>(Grades 12–13)</span>
            </div>
            <div className="text-4xl md:text-6xl font-black text-indigo-400">{stats.alStudents}</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-6 text-xs text-slate-500 font-mono relative z-10">
        <div>MINDORA MICROBIOLOGY EXHIBITION SYSTEM • ONLINE REAL-TIME DISPLAY</div>
        <div className="flex items-center space-x-4">
          <span>Active Schools: <strong className="text-white">{stats.totalSchools}</strong></span>
          {isAdmin && (
            <button
              onClick={() => triggerTestMilestone(stats.totalVisitors || 100)}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1 rounded-full border border-slate-700 transition"
              title="Test Milestone Celebration Overlay (Admin Only)"
            >
              🎉 Demo Milestone
            </button>
          )}
        </div>
      </footer>

      {/* Milestone Celebration Full-Screen Overlay */}
      {activeMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl p-4">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-2 border-amber-400/60 rounded-[40px] p-8 md:p-14 max-w-2xl w-full text-center space-y-6 shadow-2xl relative overflow-hidden animate-pop-in">
            {/* Glowing Backdrop */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Close Button */}
            <button
              onClick={() => setActiveMilestone(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/50 transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/40 text-amber-400 px-6 py-2.5 rounded-full font-extrabold text-sm tracking-widest uppercase">
              <PartyPopper className="w-5 h-5 text-amber-400 animate-bounce" />
              <span>EXHIBITION MILESTONE ACHIEVED</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>

            <div className="space-y-2">
              <div className="text-7xl md:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 drop-shadow-2xl">
                {activeMilestone}+
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase">
                VISITORS CELEBRATION!
              </h2>
            </div>

            <p className="text-sm md:text-base text-slate-300 max-w-md mx-auto font-medium leading-relaxed">
              MINDORA Microbiology Exhibition has officially passed <strong>{activeMilestone} registrations</strong>! Thank you to all participating students and teachers.
            </p>

            <div className="pt-4 flex items-center justify-center">
              <button
                onClick={() => setActiveMilestone(null)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm px-8 py-3.5 rounded-2xl shadow-xl transition transform hover:scale-105"
              >
                CONTINUE LIVE DISPLAY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

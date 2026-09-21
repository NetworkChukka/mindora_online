import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  GraduationCap,
  PartyPopper,
  Sparkles,
  Trophy,
  X,
  Zap
} from 'lucide-react';

/**
 * Vertical Rolling Odometer Digit Component
 */
function RollingDigit({ digit }) {
  const num = parseInt(digit, 10);
  if (isNaN(num)) return <span>{digit}</span>;

  return (
    <span className="inline-block h-[1.08em] overflow-hidden align-middle relative">
      <span
        className="flex flex-col transition-transform duration-300 ease-out"
        style={{ transform: `translateY(-${num * 10}%)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-[1.08em] flex items-center justify-center">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Smooth Animated Rolling Counter Component
 */
function RollingCounter({ value, duration = 1000 }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const animRef = useRef(null);
  const startTimeRef = useRef(null);
  const startValRef = useRef(0);

  useEffect(() => {
    const startVal = startValRef.current;
    const endVal = typeof value === 'number' ? value : parseInt(value, 10) || 0;
    
    if (startVal === endVal) {
      setAnimatedValue(endVal);
      return;
    }

    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * ease);

      setAnimatedValue(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedValue(endVal);
        startValRef.current = endVal;
        startTimeRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [value, duration]);

  const str = (animatedValue || 0).toString();

  return (
    <span className="inline-flex items-center leading-none font-mono">
      {str.split('').map((char, i) => (
        <RollingDigit key={str.length - 1 - i} digit={char} />
      ))}
    </span>
  );
}

export default function DisplayPage() {
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
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 }
    });

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
    }, 350);
  };

  // Milestone triggers specifically at 100X intervals (100, 200, 300, 400, 500...)
  const checkMilestone = (current, previous) => {
    if (current <= 0) return;
    const currentMilestone = Math.floor(current / 100) * 100;
    const previousMilestone = Math.floor(previous / 100) * 100;

    if (currentMilestone > 0 && currentMilestone > previousMilestone) {
      setActiveMilestone(currentMilestone);
      triggerConfetti();
    }
  };

  const triggerTestMilestone = (m = 100) => {
    setActiveMilestone(m);
    triggerConfetti();
  };

  // Calculate Next 100X Milestone and Progress Percentage towards it
  const getNextMilestoneData = () => {
    const total = stats.totalVisitors;
    const nextTarget = Math.max(100, Math.ceil((total + 1) / 100) * 100);
    const prevTarget = nextTarget - 100;
    const progress = Math.min(100, Math.max(0, Math.round(((total - prevTarget) / 100) * 100)));
    return { target: nextTarget, progress };
  };

  const { target: nextMilestoneTarget, progress: milestoneProgress } = getNextMilestoneData();

  useEffect(() => {
    fetchStats();
    // 10-second automatic stats sync timer
    const interval = setInterval(() => {
      fetchStats();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen text-white flex flex-col justify-between p-6 md:p-10 font-sans relative overflow-hidden bg-animated-gradient selection:bg-emerald-500">
      {/* Dynamic Keyframe Animations */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .bg-animated-gradient {
          background: linear-gradient(-45deg, #020617, #0b1329, #1e1b4b, #064e3b, #0f172a);
          background-size: 400% 400%;
          animation: gradientMove 14s ease infinite;
        }

        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.1); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.15); }
        }
        .animate-float-orb-1 {
          animation: floatOrb1 12s ease-in-out infinite;
        }
        .animate-float-orb-2 {
          animation: floatOrb2 15s ease-in-out infinite;
        }

        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* Floating Ambient Background Orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-float-orb-1"></div>
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none animate-float-orb-2"></div>
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none animate-float-orb-1"></div>

      {/* Top TV Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-2 rounded-2xl shadow-2xl flex items-center h-16 transform hover:scale-105 transition">
            <img
              src="/assets/mindora-logo.jpg"
              alt="MINDORA Logo"
              className="h-12 w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-wider text-white">MINDORA</h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest">
                LIVE EXHIBITION
              </span>
            </div>
            <p className="text-xs md:text-sm text-emerald-400 font-bold tracking-[0.3em] uppercase mt-1">
              MICROBIOLOGY EXHIBITION • VISITOR REGISTRATION DISPLAY
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-mono bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-full shadow-lg">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-bold tracking-wider text-slate-200">AUTO SYNC (10S)</span>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 tracking-wider">LAST UPDATE</div>
            <div className="text-sm font-mono font-bold text-slate-200">
              {new Date(stats.lastUpdated).toLocaleTimeString('en-LK', { timeZone: 'Asia/Colombo' })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Exhibition Counter Section */}
      <main className="my-6 space-y-8 relative z-10">
        {/* Main Hero Visitor Counter Card */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/60 p-8 md:p-12 rounded-[40px] shadow-2xl text-center relative overflow-hidden group">
          <div className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-slate-400 mb-2 flex items-center justify-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>TOTAL EXHIBITION VISITORS</span>
            <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
          </div>

          {/* Large Clean Vertical Rolling Counter */}
          <div className="text-8xl md:text-[160px] font-black tracking-tight text-white leading-none my-3 transform transition duration-500 group-hover:scale-105">
            <RollingCounter value={stats.totalVisitors} duration={1200} />
          </div>

          {/* Today's Registrations Pill */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 px-6 py-2.5 rounded-full font-extrabold text-sm md:text-base shadow-lg">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Today's Registrations: +<RollingCounter value={stats.todaysRegistrations} duration={800} /></span>
          </div>

          {/* Next 100X Milestone Progress Bar */}
          <div className="mt-8 max-w-xl mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 tracking-wider">
              <span className="flex items-center space-x-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>PROGRESS TO NEXT MILESTONE ({nextMilestoneTarget} VISITORS)</span>
              </span>
              <span className="text-emerald-400 font-mono font-extrabold">{milestoneProgress}%</span>
            </div>

            <div className="h-3.5 bg-slate-950/80 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${milestoneProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Cards Grid with Rolling Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 p-6 rounded-3xl text-center space-y-2 hover:border-blue-500/60 hover:shadow-blue-500/10 transition transform hover:-translate-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Students</span>
            </div>
            <div className="text-4xl md:text-6xl font-black text-white">
              <RollingCounter value={stats.totalStudents} duration={1000} />
            </div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 p-6 rounded-3xl text-center space-y-2 hover:border-emerald-500/60 hover:shadow-emerald-500/10 transition transform hover:-translate-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Teachers</span>
            </div>
            <div className="text-4xl md:text-6xl font-black text-emerald-400">
              <RollingCounter value={stats.totalTeachers} duration={1000} />
            </div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 p-6 rounded-3xl text-center space-y-2 hover:border-blue-400/60 hover:shadow-blue-400/10 transition transform hover:-translate-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
              <span className="text-blue-400 font-bold">O/L</span>
              <span>(Grades 6–11)</span>
            </div>
            <div className="text-4xl md:text-6xl font-black text-blue-400">
              <RollingCounter value={stats.olStudents} duration={1000} />
            </div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 p-6 rounded-3xl text-center space-y-2 hover:border-indigo-400/60 hover:shadow-indigo-400/10 transition transform hover:-translate-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center space-x-1.5">
              <span className="text-indigo-400 font-bold">A/L</span>
              <span>(Grades 12–13)</span>
            </div>
            <div className="text-4xl md:text-6xl font-black text-indigo-400">
              <RollingCounter value={stats.alStudents} duration={1000} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-4 text-xs text-slate-500 font-mono relative z-10 mt-3">
        <div>MINDORA MICROBIOLOGY EXHIBITION SYSTEM • ONLINE REAL-TIME DISPLAY</div>
        <div className="flex items-center space-x-4">
          <span>Active Schools: <strong className="text-white">{stats.totalSchools}</strong></span>
          {isAdmin && (
            <button
              onClick={() => triggerTestMilestone(100)}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1 rounded-full border border-slate-700 transition"
              title="Test 100 Milestone Celebration Overlay (Admin Only)"
            >
              🎉 Demo 100 Milestone
            </button>
          )}
        </div>
      </footer>

      {/* Milestone Celebration Full-Screen Overlay */}
      {activeMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-2 border-amber-400/70 rounded-[40px] p-8 md:p-14 max-w-2xl w-full text-center space-y-6 shadow-2xl relative overflow-hidden animate-pop-in">
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  GraduationCap,
  BookOpen,
  School,
  Sparkles,
  Tv,
  LogIn,
  Award,
  TrendingUp,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowRight
} from 'lucide-react';

export default function EventHighlightsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalStudents: 0,
    totalTeachers: 0,
    olStudents: 0,
    alStudents: 0,
    totalSchools: 0
  });

  const [topSchools, setTopSchools] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHighlightsData = async () => {
    try {
      setLoading(true);
      const [statsRes, schoolsRes, gradesRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/schools'),
        axios.get('/api/dashboard/grades')
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (schoolsRes.data?.success) setTopSchools(schoolsRes.data.data || []);
      if (gradesRes.data?.success) setGradeData(gradesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load event highlights data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlightsData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none"></div>

      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white">MINDORA EXHIBITION</h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">OFFICIAL EVENT HIGHLIGHTS</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/display"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center space-x-2"
            >
              <Tv className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">TV DISPLAY</span>
            </Link>

            <Link
              to="/login"
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>OPERATOR LOGIN</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12 relative z-10 flex-1 w-full">
        {/* Hero Event Conclusion Banner */}
        <div className="relative rounded-[36px] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 p-8 md:p-14 text-center overflow-hidden shadow-2xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>EXHIBITION SUCCESSFULLY CONCLUDED</span>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              MINDORA MICROBIOLOGY EXHIBITION
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed">
              Celebrating a landmark achievement in Sri Lankan science education. Below is the official summary of total visitor participation, school involvement, and secondary education engagement.
            </p>
          </div>

          {/* Grand Total Visitors Showcase */}
          <div className="pt-4">
            <div className="inline-block bg-slate-950/80 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
              <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
                TOTAL EXHIBITION VISITORS
              </div>
              <div className="text-6xl md:text-8xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500">
                {stats.totalVisitors.toLocaleString()}
              </div>
              <div className="text-xs text-emerald-400 font-bold tracking-wider mt-2 flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>VERIFIED & AUDITED ATTENDANCE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">{stats.totalVisitors}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total Visitors</div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">Students + Escort Faculty</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">{stats.totalStudents}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Student Visitors</div>
              <div className="text-[11px] text-indigo-400 mt-1 font-semibold">O/L: {stats.olStudents} | A/L: {stats.alStudents}</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">{stats.totalTeachers}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Teachers & Faculty</div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">Escort Teachers & Principals</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">{stats.totalSchools}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Active Schools</div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">Participating Schools List</div>
            </div>
          </div>
        </div>

        {/* Leaderboard and Education Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Participating Schools Leaderboard (2 Cols) */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <Award className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-black text-white">TOP PARTICIPATING SCHOOLS</h3>
              </div>
              <span className="text-xs text-amber-400 font-bold bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
                Leaderboard Rank
              </span>
            </div>

            <div className="space-y-3">
              {topSchools.length > 0 ? (
                topSchools.slice(0, 8).map((s, idx) => (
                  <div
                    key={s.schoolName || idx}
                    className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{s.schoolName}</div>
                        <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                          <span>{s.totalStudents || 0} Students</span>
                          <span>•</span>
                          <span>{s.totalTeachers || 0} Teachers</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-400 font-mono">
                        {s.totalVisitors}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Visitors</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">Loading schools leaderboard...</div>
              )}
            </div>
          </div>

          {/* Education Level Breakdown Side Panel (1 Col) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-black text-white">STUDENT BREAKDOWN</h3>
              </div>

              {/* O/L Secondary Section */}
              <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-blue-400 uppercase tracking-wider">O/L Secondary (Grades 6–11)</span>
                  <span className="text-white font-mono text-base">{stats.olStudents}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        stats.totalStudents > 0 ? Math.round((stats.olStudents / stats.totalStudents) * 100) : 0
                      }%`
                    }}
                  ></div>
                </div>
                <div className="text-[11px] text-slate-500 text-right">
                  {stats.totalStudents > 0 ? Math.round((stats.olStudents / stats.totalStudents) * 100) : 0}% of student visitors
                </div>
              </div>

              {/* A/L Senior Section */}
              <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-400 uppercase tracking-wider">A/L Senior (Grades 12–13)</span>
                  <span className="text-white font-mono text-base">{stats.alStudents}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        stats.totalStudents > 0 ? Math.round((stats.alStudents / stats.totalStudents) * 100) : 0
                      }%`
                    }}
                  ></div>
                </div>
                <div className="text-[11px] text-slate-500 text-right">
                  {stats.totalStudents > 0 ? Math.round((stats.alStudents / stats.totalStudents) * 100) : 0}% of student visitors
                </div>
              </div>
            </div>

            {/* Quick Access CTA Box */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">OPERATOR ACCESS</div>
              <p className="text-xs text-slate-500">
                Authorized staff & operators can log in using direct link <code className="text-emerald-400 font-mono">/login</code>.
              </p>
              <Link
                to="/login"
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition"
              >
                <span>Go to Login Page (/login)</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-6 py-6 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} MINDORA Microbiology Exhibition. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 font-medium text-slate-400">
            <Link to="/display" className="hover:text-emerald-400 transition">TV Display</Link>
            <span>•</span>
            <Link to="/login" className="hover:text-emerald-400 transition">Operator Login (/login)</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

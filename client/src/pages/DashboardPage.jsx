import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import StatCard from '../components/StatCard';
import {
  Users,
  GraduationCap,
  BookOpen,
  School,
  CalendarCheck,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const { latestStats } = useSocket();
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalStudents: 0,
    totalTeachers: 0,
    olStudents: 0,
    alStudents: 0,
    totalSchools: 0,
    todaysRegistrations: 0
  });

  const [gradeData, setGradeData] = useState([]);
  const [schoolLeaderboard, setSchoolLeaderboard] = useState([]);
  const [operatorLeaderboard, setOperatorLeaderboard] = useState([]);
  const [hourlyTimeline, setHourlyTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, gradesRes, schoolsRes, operatorsRes, hourlyRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/grades'),
        axios.get('/api/dashboard/schools'),
        axios.get('/api/dashboard/operators'),
        axios.get('/api/dashboard/hourly')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (gradesRes.data.success) setGradeData(gradesRes.data.data);
      if (schoolsRes.data.success) setSchoolLeaderboard(schoolsRes.data.data.slice(0, 10));
      if (operatorsRes.data.success) setOperatorLeaderboard(operatorsRes.data.data);
      if (hourlyRes.data.success) setHourlyTimeline(hourlyRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Live Sync Polling every 4 seconds for serverless Vercel environment
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update real-time stats if Socket.IO or polling pushes updates
  useEffect(() => {
    if (latestStats) {
      setStats((prev) => ({ ...prev, ...latestStats }));
    }
  }, [latestStats]);

  // Chart configuration for Grade Distribution
  const gradeChartConfig = {
    labels: gradeData.map((g) => g.grade),
    datasets: [
      {
        label: 'Visitors Count',
        data: gradeData.map((g) => g.count),
        backgroundColor: gradeData.map((g) => (g.level === 'O/L' ? '#2563eb' : '#059669')),
        borderRadius: 8
      }
    ]
  };

  // Chart configuration for Hourly Registrations
  const hourlyChartConfig = {
    labels: hourlyTimeline.map((h) => h.hour),
    datasets: [
      {
        label: 'Students',
        data: hourlyTimeline.map((h) => h.students),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Teachers',
        data: hourlyTimeline.map((h) => h.teachers),
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">REAL-TIME EXHIBITION DASHBOARD</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Live visitor counts (auto-synced every 4 seconds)</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-xl transition"
        >
          Refresh Now
        </button>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Visitors"
          value={stats.totalVisitors}
          subtitle="Students + Teachers"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle={`O/L: ${stats.olStudents} | A/L: ${stats.alStudents}`}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers}
          subtitle="Faculty & Escorts"
          icon={GraduationCap}
          color="green"
        />
        <StatCard
          title="Active Schools"
          value={stats.totalSchools}
          subtitle={`Today: +${stats.todaysRegistrations}`}
          icon={School}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Grade Distribution (6–13)</span>
            </h3>
            <div className="flex items-center space-x-3 text-xs font-bold">
              <span className="text-blue-600 font-semibold">● O/L (6-11)</span>
              <span className="text-emerald-600 font-semibold">● A/L (12-13)</span>
            </div>
          </div>
          <div className="h-64">
            <Bar
              data={gradeChartConfig}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>

        {/* Hourly Registration Traffic */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            <span>Hourly Registration Rate</span>
          </h3>
          <div className="h-64">
            <Line
              data={hourlyChartConfig}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Participating Schools */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Top Participating Schools</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">School</th>
                  <th className="p-3 text-center">Visitors</th>
                  <th className="p-3 text-center">Students</th>
                  <th className="p-3 text-center">Teachers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schoolLeaderboard.map((s, idx) => (
                  <tr key={s.schoolId} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">
                      <span className="text-xs text-slate-400 font-normal mr-2">#{idx + 1}</span>
                      {s.schoolName}
                    </td>
                    <td className="p-3 text-center font-bold text-blue-700">{s.totalVisitors}</td>
                    <td className="p-3 text-center text-slate-600">{s.totalStudents}</td>
                    <td className="p-3 text-center text-emerald-600 font-medium">{s.totalTeachers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registration Operator Activity */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Operator Registration Leaderboard</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Operator</th>
                  <th className="p-3 text-center">Students</th>
                  <th className="p-3 text-center">Teachers</th>
                  <th className="p-3 text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operatorLeaderboard.map((op, idx) => (
                  <tr key={op.operatorId || idx} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{op.operatorName}</td>
                    <td className="p-3 text-center text-slate-600">{op.students}</td>
                    <td className="p-3 text-center text-emerald-600 font-medium">{op.teachers}</td>
                    <td className="p-3 text-center font-bold text-purple-700">{op.totalVisitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

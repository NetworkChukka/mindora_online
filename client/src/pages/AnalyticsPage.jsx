import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import { Users, GraduationCap, BookOpen, School, PieChart, BarChart } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalStudents: 0,
    totalTeachers: 0,
    olStudents: 0,
    alStudents: 0,
    totalSchools: 0
  });

  useEffect(() => {
    axios.get('/api/dashboard/stats').then(res => {
      if (res.data.success) setStats(res.data.data);
    });
  }, []);

  const visitorTypeDoughnut = {
    labels: ['Students', 'Teachers'],
    datasets: [
      {
        data: [stats.totalStudents, stats.totalTeachers],
        backgroundColor: ['#2563eb', '#059669'],
        borderWidth: 0
      }
    ]
  };

  const levelDoughnut = {
    labels: ['O/L Students (Grades 6-11)', 'A/L Students (Grades 12-13)'],
    datasets: [
      {
        data: [stats.olStudents, stats.alStudents],
        backgroundColor: ['#3b82f6', '#10b981'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">EXHIBITION ANALYTICS</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Deep breakdown of visitor demographics and education levels</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Visitors" value={stats.totalVisitors} icon={Users} color="blue" />
        <StatCard title="Students" value={stats.totalStudents} icon={BookOpen} color="indigo" />
        <StatCard title="Teachers" value={stats.totalTeachers} icon={GraduationCap} color="green" />
        <StatCard title="Schools" value={stats.totalSchools} icon={School} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center justify-center space-x-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            <span>Students vs Teachers Ratio</span>
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={visitorTypeDoughnut} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center justify-center space-x-2">
            <PieChart className="w-5 h-5 text-emerald-600" />
            <span>O/L vs A/L Distribution</span>
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={levelDoughnut} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}

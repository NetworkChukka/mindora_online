import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  GraduationCap,
  School,
  UserCog,
  BarChart3,
  FileSpreadsheet,
  FileText,
  DatabaseBackup,
  Settings,
  Activity,
  Tv
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { label: 'Register Visitor', path: '/register', icon: UserPlus, allowed: ['ADMIN', 'REGISTRATION_OPERATOR'] },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, allowed: ['ADMIN', 'REGISTRATION_OPERATOR', 'VIEWER'] },
    { label: 'Student List', path: '/registrations', icon: Users, allowed: ['ADMIN', 'REGISTRATION_OPERATOR', 'VIEWER'] },
    { label: 'Teacher List', path: '/teachers', icon: GraduationCap, allowed: ['ADMIN', 'REGISTRATION_OPERATOR', 'VIEWER'] },
    { label: 'Schools', path: '/schools', icon: School, allowed: ['ADMIN', 'REGISTRATION_OPERATOR', 'VIEWER'] },
    { label: 'User Accounts', path: '/users', icon: UserCog, allowed: ['ADMIN'] },
    { label: 'Analytics', path: '/analytics', icon: BarChart3, allowed: ['ADMIN', 'REGISTRATION_OPERATOR', 'VIEWER'] },
    { label: 'Reports & Export', path: '/reports', icon: FileSpreadsheet, allowed: ['ADMIN'] },
    { label: 'Audit Logs', path: '/audit-logs', icon: FileText, allowed: ['ADMIN'] },
    { label: 'Backups', path: '/backups', icon: DatabaseBackup, allowed: ['ADMIN'] },
    { label: 'Event Settings', path: '/settings', icon: Settings, allowed: ['ADMIN'] },
    { label: 'System Status', path: '/system', icon: Activity, allowed: ['ADMIN'] },
    { label: 'TV Display Mode', path: '/display', icon: Tv, allowed: ['ADMIN', 'REGISTRATION_OPERATOR', 'VIEWER'], external: true }
  ];

  const filteredItems = navItems.filter(item => item.allowed.includes(user?.role || ''));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] border-r border-slate-800 flex flex-col justify-between hidden md:flex">
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          if (item.external) {
            return (
              <a
                key={item.path}
                href={item.path}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span>{item.label}</span>
              </a>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 text-center">
        <div className="text-xs text-slate-400 font-semibold">MINDORA EXHIBITION v1.0</div>
        <div className="text-[10px] text-slate-500 mt-1">Free Online Database Engine</div>
      </div>
    </aside>
  );
}

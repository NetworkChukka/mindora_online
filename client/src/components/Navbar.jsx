import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Shield,
  QrCode,
  Monitor,
  Menu,
  X,
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
import ConnectionStatus from './ConnectionStatus';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
    <>
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Official Logo */}
            <Link to={user?.role === 'ADMIN' ? '/dashboard' : '/register'} className="flex items-center space-x-3 group">
              <div className="bg-white p-1 rounded-xl shadow-md group-hover:scale-105 transition-transform flex items-center h-9 sm:h-10">
                <img
                  src="/assets/mindora-logo.jpg"
                  alt="MINDORA Logo"
                  className="h-6 sm:h-7 w-auto object-contain"
                />
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider hidden lg:inline-block">
                ONLINE LIVE
              </span>
            </Link>

            {/* Quick Actions & User Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <ConnectionStatus compact />

              <Link
                to="/connect"
                className="hidden sm:flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition font-medium"
                title="Mobile QR Connect"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-400" />
                <span>Mobile QR</span>
              </Link>

              <Link
                to="/display"
                target="_blank"
                className="hidden sm:flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition font-medium"
                title="Public TV Display Mode"
              >
                <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                <span>TV Display</span>
              </Link>

              {user && (
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-semibold text-white">{user.fullName}</div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-end space-x-1">
                      <Shield className="w-3 h-3 text-blue-400" />
                      <span className="uppercase">{user.role}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
          ></div>

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-slate-900 text-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-r border-slate-800 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-white p-1 rounded-lg">
                    <img src="/assets/mindora-logo.jpg" alt="Logo" className="h-6 w-auto" />
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Info */}
              {user && (
                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/50 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{user.fullName}</div>
                    <div className="text-xs text-emerald-400 font-semibold uppercase">{user.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-rose-400 hover:bg-slate-700 rounded-lg"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Navigation Items */}
              <div className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Navigation Menu
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
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800 transition"
                      >
                        <Icon className="w-5 h-5 text-emerald-400" />
                        <span>{item.label}</span>
                      </a>
                    );
                  }
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-bold">MINDORA EXHIBITION</div>
              <div className="text-[10px] text-slate-500">Online Registration System</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

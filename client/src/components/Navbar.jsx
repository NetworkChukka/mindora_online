import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Shield, QrCode, Monitor } from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Official Logo */}
          <Link to={user?.role === 'ADMIN' ? '/dashboard' : '/register'} className="flex items-center space-x-3 group">
            <div className="bg-white p-1.5 rounded-xl shadow-md group-hover:scale-105 transition-transform flex items-center h-10">
              <img
                src="/assets/mindora-logo.jpg"
                alt="MINDORA Logo"
                className="h-7 w-auto object-contain"
              />
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block">
              ONLINE LIVE
            </span>
          </Link>

          {/* Quick Actions & User Profile */}
          <div className="flex items-center space-x-3">
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
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
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
  );
}

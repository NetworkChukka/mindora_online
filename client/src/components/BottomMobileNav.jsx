import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, LayoutDashboard, Users, School, BarChart3, Settings } from 'lucide-react';

export default function BottomMobileNav() {
  const { user } = useAuth();
  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-800 text-slate-400 px-2 py-1 shadow-2xl backdrop-blur-lg">
      <div className="flex items-center justify-around">
        <NavLink
          to="/register"
          className={({ isActive }) =>
            `flex flex-col items-center py-1.5 px-3 rounded-xl text-xs font-bold transition ${
              isActive ? 'text-blue-400 bg-blue-500/10' : 'hover:text-slate-200'
            }`
          }
        >
          <UserPlus className="w-5 h-5 mb-0.5" />
          <span>Register</span>
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center py-1.5 px-3 rounded-xl text-xs font-bold transition ${
              isActive ? 'text-blue-400 bg-blue-500/10' : 'hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/registrations"
          className={({ isActive }) =>
            `flex flex-col items-center py-1.5 px-3 rounded-xl text-xs font-bold transition ${
              isActive ? 'text-blue-400 bg-blue-500/10' : 'hover:text-slate-200'
            }`
          }
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Students</span>
        </NavLink>

        <NavLink
          to="/schools"
          className={({ isActive }) =>
            `flex flex-col items-center py-1.5 px-3 rounded-xl text-xs font-bold transition ${
              isActive ? 'text-blue-400 bg-blue-500/10' : 'hover:text-slate-200'
            }`
          }
        >
          <School className="w-5 h-5 mb-0.5" />
          <span>Schools</span>
        </NavLink>

        {isAdmin ? (
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                isActive ? 'text-blue-400 bg-blue-500/10' : 'hover:text-slate-200'
              }`
            }
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span>Reports</span>
          </NavLink>
        ) : (
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                isActive ? 'text-blue-400 bg-blue-500/10' : 'hover:text-slate-200'
              }`
            }
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span>Analytics</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}

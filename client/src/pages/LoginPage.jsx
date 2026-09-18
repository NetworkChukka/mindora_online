import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, LogIn, Loader2, QrCode } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await login(username, password);
      if (data.user?.role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/register');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-4 sm:p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-700">
          <div className="bg-white p-8 text-center text-slate-900 border-b border-slate-200 flex flex-col items-center justify-center">
            <img
              src="/assets/mindora-logo.jpg"
              alt="MINDORA Microbiology Exhibition Logo"
              className="h-16 w-auto object-contain mx-auto mb-2"
            />
            <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase mt-1">
              VISITOR REGISTRATION & MANAGEMENT SYSTEM
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="desk01"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-base font-semibold"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-base"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-blue-700 hover:bg-blue-800 text-white font-bold text-lg rounded-xl shadow-lg transition transform active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>LOGIN</span>
                </>
              )}
            </button>
          </form>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium px-6">
            <span>Online Multi-Device Sync</span>
            <Link to="/connect" className="text-blue-600 font-bold hover:underline flex items-center space-x-1">
              <QrCode className="w-3.5 h-3.5" />
              <span>Mobile QR</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

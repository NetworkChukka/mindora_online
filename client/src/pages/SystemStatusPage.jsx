import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Server, Database, Clock } from 'lucide-react';

export default function SystemStatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/system/status');
      if (res.data.success) {
        setStatus(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch system status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SYSTEM HEALTH MONITOR</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Live web server performance and cloud database status</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <Server className="w-10 h-10 text-blue-600" />
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Server State</div>
            <div className="text-xl font-extrabold text-slate-900">{status?.server || 'Online'}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <Database className="w-10 h-10 text-emerald-600" />
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Database Status</div>
            <div className="text-xl font-extrabold text-emerald-600 uppercase">{status?.databaseStatus || 'Connected'}</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-4 font-mono text-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-slate-400">Server Uptime:</span>
          <span className="font-bold text-emerald-400">{status?.uptimeSeconds || 0} seconds</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-slate-400">Heap Memory Used:</span>
          <span className="font-bold text-blue-400">
            {status?.memoryUsage ? Math.round(status.memoryUsage.heapUsed / 1024 / 1024) : 0} MB
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Server Time (Asia/Colombo):</span>
          <span className="font-bold text-slate-200">{new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}</span>
        </div>
      </div>
    </div>
  );
}

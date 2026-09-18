import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, ShieldAlert } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/audit-logs', { params: { page, limit: 25 } });
      if (res.data.success) {
        setLogs(res.data.data);
        setTotal(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SYSTEM AUDIT LOGS</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Immutable record of admin & operator system actions</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Description</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading audit trail...</td></tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 font-mono text-xs">
                    <td className="p-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-4 font-bold text-slate-900">{log.userName}</td>
                    <td className="p-4 font-bold text-blue-700">{log.action}</td>
                    <td className="p-4 text-slate-700 font-sans text-sm">{log.description}</td>
                    <td className="p-4 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No audit logs recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

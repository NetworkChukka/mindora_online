import React, { useState } from 'react';
import { DatabaseBackup, Download, ShieldCheck, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function BackupsPage() {
  const [confirmText, setConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  const handleExportFullBackup = async () => {
    try {
      const res = await axios.get('/api/reports/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MINDORA_FULL_BACKUP_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Failed to generate full data backup.');
    }
  };

  const handlePurgeData = async (e) => {
    e.preventDefault();
    if (confirmText !== 'RESET') {
      alert('Please type "RESET" in capital letters to confirm data purge.');
      return;
    }

    try {
      setResetting(true);
      const res = await axios.post('/api/registrations/reset', { confirmText: 'RESET' });
      if (res.data.success) {
        setResetResult(res.data);
        setConfirmText('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to purge registration data.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">DATABASE BACKUP & DATA RESET</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Preserve exhibition archives or purge test data before live event start</p>
      </div>

      {/* Backup Download Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-start space-x-4">
          <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl">
            <DatabaseBackup className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">On-Demand Full Data Export</h3>
            <p className="text-xs text-slate-500 mt-1">
              Download complete database snapshots (Students, Teachers, Schools, and Summaries) in Excel workbook format.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportFullBackup}
          className="w-full py-4 px-6 bg-blue-700 hover:bg-blue-800 text-white font-bold text-base rounded-2xl shadow-lg transition flex items-center justify-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>DOWNLOAD FULL DATABASE BACKUP (.XLSX)</span>
        </button>
      </div>

      {/* Purge Test Data Card */}
      <div className="bg-rose-50 p-8 rounded-3xl border border-rose-200 shadow-sm space-y-6 text-rose-950">
        <div className="flex items-start space-x-4">
          <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-md">
            <Trash2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-rose-900">Purge & Reset Exhibition Registration Data</h3>
            <p className="text-xs text-rose-700 mt-1">
              Clears all test student and teacher registrations and resets sequence IDs back to <code>MIN-000001</code> and <code>TCH-000001</code> for your official event start.
            </p>
          </div>
        </div>

        {resetResult && (
          <div className="p-4 bg-white border border-emerald-300 text-emerald-800 rounded-2xl flex items-center space-x-3 text-sm font-bold shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <div>{resetResult.message}</div>
              <div className="text-xs text-slate-500 font-normal mt-0.5">
                Purged {resetResult.summary.studentsPurged} students & {resetResult.summary.teachersPurged} teachers.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handlePurgeData} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-extrabold text-rose-900 mb-1 uppercase tracking-wider">
              Type "RESET" to confirm data purge:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="RESET"
              className="w-full p-3 bg-white border border-rose-300 rounded-xl text-sm font-mono font-bold text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
          </div>

          <button
            type="submit"
            disabled={resetting || confirmText !== 'RESET'}
            className="w-full py-4 px-6 bg-rose-600 hover:bg-rose-700 text-white font-bold text-base rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>{resetting ? 'PURGING DATA...' : 'PURGE TEST DATA & RESET SEQUENCES'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

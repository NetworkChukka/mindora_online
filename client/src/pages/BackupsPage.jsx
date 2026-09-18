import React from 'react';
import { DatabaseBackup, Download, ShieldCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function BackupsPage() {
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">DATABASE BACKUP & EXPORT STRATEGY</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Preserve exhibition data safely with downloadable offline backups</p>
      </div>

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

        <div className="p-4 bg-slate-900 text-slate-300 rounded-2xl text-xs space-y-2">
          <div className="font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>FREE-TIER CLOUD BACKUP NOTICE</span>
          </div>
          <p>
            When deployed on free tier MongoDB Atlas (M0 cluster), automatic point-in-time cloud snapshots may have tier limitations. Performing periodic manual exports during key exhibition breaks guarantees 100% data safety.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import axios from 'axios';
import { FileSpreadsheet, FileText, Download, Printer, Filter } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('all'); // 'all' | 'students' | 'teachers'
  const [educationLevel, setEducationLevel] = useState('');
  const [grade, setGrade] = useState('');
  const [downloading, setDownloading] = useState(false);

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      const res = await axios.get('/api/reports/excel', {
        params: { educationLevel, grade },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MINDORA_Report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Failed to generate Excel export.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      setDownloading(true);
      const res = await axios.get('/api/reports/csv', {
        params: { type: reportType, educationLevel, grade },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MINDORA_${reportType}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Failed to generate CSV export.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const res = await axios.get('/api/reports/pdf', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MINDORA_Report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Failed to generate PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">EXHIBITION REPORTS & EXPORTS</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Export official visitor data in Excel, CSV, or PDF formats</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <span>Report Filter Options</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Visitor Scope</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
            >
              <option value="all">All Visitors (Students + Teachers)</option>
              <option value="students">Students Only</option>
              <option value="teachers">Teachers Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Education Level</label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
            >
              <option value="">All Levels (O/L & A/L)</option>
              <option value="O/L">O/L (Grades 6-11)</option>
              <option value="A/L">A/L (Grades 12-13)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Specific Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
            >
              <option value="">All Grades (6–13)</option>
              {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Excel Download Button */}
          <button
            onClick={handleDownloadExcel}
            disabled={downloading}
            className="p-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-lg transition text-left space-y-3 group disabled:opacity-50"
          >
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base">EXCEL WORKBOOK</div>
              <div className="text-xs text-slate-400 mt-0.5">Multi-sheet format with all tables & summaries</div>
            </div>
            <div className="text-xs font-bold text-emerald-400 group-hover:underline flex items-center space-x-1">
              <Download className="w-3.5 h-3.5" />
              <span>Download .XLSX</span>
            </div>
          </button>

          {/* CSV Download Button */}
          <button
            onClick={handleDownloadCsv}
            disabled={downloading}
            className="p-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-lg transition text-left space-y-3 group disabled:opacity-50"
          >
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base">UTF-8 CSV DATA</div>
              <div className="text-xs text-slate-400 mt-0.5">Unicode-friendly format for Sinhala & text tools</div>
            </div>
            <div className="text-xs font-bold text-blue-400 group-hover:underline flex items-center space-x-1">
              <Download className="w-3.5 h-3.5" />
              <span>Download .CSV</span>
            </div>
          </button>

          {/* PDF Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="p-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-lg transition text-left space-y-3 group disabled:opacity-50"
          >
            <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base">PDF DOCUMENT</div>
              <div className="text-xs text-slate-400 mt-0.5">Formated executive report with MINDORA header</div>
            </div>
            <div className="text-xs font-bold text-purple-400 group-hover:underline flex items-center space-x-1">
              <Download className="w-3.5 h-3.5" />
              <span>Download .PDF</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

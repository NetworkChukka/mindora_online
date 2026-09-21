import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AddSchoolModal from '../components/AddSchoolModal';
import EditSchoolModal from '../components/EditSchoolModal';
import {
  School,
  Search,
  Plus,
  Upload,
  Power,
  Edit3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function SchoolsPage() {
  const { isAdmin } = useAuth();
  const [schools, setSchools] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editSchool, setEditSchool] = useState(null);

  // Bulk Import state
  const [importText, setImportText] = useState('');
  const [importSummary, setImportSummary] = useState(null);
  const [importing, setImporting] = useState(false);

  const fetchSchools = async (currentPage = page, currentLimit = limit, currentSearch = search) => {
    try {
      setLoading(true);
      const res = await axios.get('/api/schools', {
        params: { search: currentSearch, page: currentPage, limit: currentLimit, status: 'ALL' }
      });
      if (res.data.success) {
        setSchools(res.data.data);
        const totalCount = res.data.pagination.total;
        setTotal(totalCount);
        setTotalPages(res.data.pagination.pages || Math.ceil(totalCount / currentLimit) || 1);
      }
    } catch (err) {
      console.error('Failed to fetch schools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools(page, limit, search);
  }, [page, limit]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    fetchSchools(1, limit, val);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSchools(1, limit, search);
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setLimit(newLimit);
    setPage(1);
  };

  const handleToggleStatus = async (school) => {
    try {
      const res = await axios.delete(`/api/schools/${school._id}`);
      if (res.data.success) {
        fetchSchools(page, limit, search);
      }
    } catch (err) {
      alert('Failed to update school status.');
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!importText.trim()) return;

    try {
      setImporting(true);
      const lines = importText.split('\n').filter(l => l.trim().length > 0);
      const items = lines.map(line => {
        const parts = line.split(',');
        return {
          schoolName: parts[0]?.trim(),
          city: parts[1]?.trim() || '',
          district: parts[2]?.trim() || ''
        };
      });

      const res = await axios.post('/api/schools/import', { schools: items });
      if (res.data.success) {
        setImportSummary(res.data.summary);
        setImportText('');
        fetchSchools(page, limit, search);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to import schools.');
    } finally {
      setImporting(false);
    }
  };

  // Generate page numbers for pagination
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
            page === i
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SHARED SCHOOL DATABASE</h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
              {total} Schools Total
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">Central database used by both student and teacher registration operators</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>ADD SCHOOL</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search school name, city, or district..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </form>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-semibold">Rows per page:</span>
          <select
            value={limit}
            onChange={handleLimitChange}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value={20}>20 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
            <option value={500}>All (500)</option>
          </select>
        </div>
      </div>

      {/* Admin Bulk Import Panel */}
      {isAdmin && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
          <h3 className="font-bold text-base flex items-center space-x-2 text-emerald-400">
            <Upload className="w-5 h-5" />
            <span>BULK SCHOOL IMPORT (CSV / NEWLINE FORMAT)</span>
          </h3>
          <p className="text-xs text-slate-300">
            Paste school names line-by-line (e.g., <code>School Name, City, District</code>):
          </p>

          <form onSubmit={handleBulkImport} className="space-y-3">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Anuradhapura Central College, Anuradhapura, Anuradhapura\nRoyal College, Colombo, Colombo\nRichmond College, Galle, Galle`}
              rows={3}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={importing || !importText.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              {importing ? 'IMPORTING...' : 'IMPORT SCHOOLS'}
            </button>
          </form>

          {importSummary && (
            <div className="p-3 bg-slate-800 rounded-xl text-xs flex items-center space-x-4 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Imported: <strong>{importSummary.imported}</strong></span>
              <span>Skipped Duplicates: <strong>{importSummary.skipped}</strong></span>
              <span>Errors: <strong>{importSummary.errors}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Schools Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">School Name</th>
                <th className="p-4">City</th>
                <th className="p-4">District</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created By</th>
                {isAdmin && <th className="p-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-slate-500">
                    Loading schools database...
                  </td>
                </tr>
              ) : schools.length > 0 ? (
                schools.map((s, idx) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="p-4 text-xs text-slate-400 font-semibold">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="p-4 font-bold text-slate-900">{s.schoolName}</td>
                    <td className="p-4 text-slate-600 font-medium">{s.city || '—'}</td>
                    <td className="p-4 text-slate-600 font-medium">{s.district || '—'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">{s.createdByName || 'System'}</td>
                    {isAdmin && (
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setEditSchool(s)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit School Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(s)}
                            className={`p-2 rounded-lg transition ${
                              s.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title="Toggle Active Status"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-slate-500 font-medium">
                    No school records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Bar */}
        {total > 0 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-bold text-slate-900">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-bold text-slate-900">{total}</span> schools
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {renderPageNumbers()}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddSchoolModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSchoolCreated={() => fetchSchools(page, limit, search)}
      />

      <EditSchoolModal
        isOpen={!!editSchool}
        school={editSchool}
        onClose={() => setEditSchool(null)}
        onSchoolUpdated={() => fetchSchools(page, limit, search)}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Trash2, Edit, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RegistrationsPage() {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editStudent, setEditStudent] = useState(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('10');
  const [editPhone, setEditPhone] = useState('');

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/registrations/students', {
        params: {
          search,
          grade: gradeFilter,
          educationLevel: levelFilter,
          page,
          limit: 15
        }
      });
      if (res.data.success) {
        setStudents(res.data.data);
        setTotal(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, gradeFilter, levelFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleSaveEdit = async () => {
    if (!editStudent) return;
    try {
      const res = await axios.put(`/api/registrations/students/${editStudent._id}`, {
        studentName: editName,
        grade: parseInt(editGrade),
        phoneNumber: editPhone
      });
      if (res.data.success) {
        setEditStudent(null);
        fetchStudents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await axios.delete(`/api/registrations/students/${deleteTarget._id}`);
      if (res.data.success) {
        setDeleteTarget(null);
        fetchStudents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to soft delete student.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">STUDENT REGISTRATIONS</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Search and manage all student exhibition visitors</p>
        </div>
        <div className="text-xs font-bold bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-xl">
          Total Registered: {total}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, MIN-XXXXXX, or school..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </form>

        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700"
        >
          <option value="">All Grades</option>
          {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
            <option key={g} value={g}>Grade {g}</option>
          ))}
        </select>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700"
        >
          <option value="">All Levels (O/L & A/L)</option>
          <option value="O/L">O/L (Grades 6-11)</option>
          <option value="A/L">A/L (Grades 12-13)</option>
        </select>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">Reg ID</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">School</th>
                <th className="p-4">Grade</th>
                <th className="p-4">Level</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Registered By</th>
                {isAdmin && <th className="p-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">Loading student records...</td>
                </tr>
              ) : students.length > 0 ? (
                students.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="p-4 font-extrabold text-blue-700 font-mono">{s.registrationNumber}</td>
                    <td className="p-4 font-bold text-slate-900">{s.studentName}</td>
                    <td className="p-4 text-slate-700 font-medium">{s.schoolNameSnapshot}</td>
                    <td className="p-4 font-bold text-slate-800">Grade {s.grade}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        s.educationLevel === 'O/L' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {s.educationLevel}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-xs">{s.phoneNumber || '—'}</td>
                    <td className="p-4 text-xs text-slate-500">{s.registeredByName}</td>
                    {isAdmin && (
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              setEditStudent(s);
                              setEditName(s.studentName);
                              setEditGrade(String(s.grade));
                              setEditPhone(s.phoneNumber || '');
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Soft Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">No student registrations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Showing Page {page} of {Math.ceil(total / 15) || 1}</span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page * 15 >= total}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      {editStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Edit Student Registration</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Grade</label>
              <select
                value={editGrade}
                onChange={(e) => setEditGrade(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"
              >
                {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setEditStudent(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm shadow">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
            <h3 className="font-bold text-lg text-slate-900">Soft Delete Registration?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to soft-delete <strong>{deleteTarget.registrationNumber} ({deleteTarget.studentName})</strong>? This will remove the record from normal exhibition counts.
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm">Cancel</button>
              <button onClick={handleConfirmDelete} className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl text-sm shadow">CONFIRM DELETE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

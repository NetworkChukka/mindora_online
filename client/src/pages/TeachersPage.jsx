import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Trash2, Edit, AlertCircle } from 'lucide-react';

export default function TeachersPage() {
  const { isAdmin } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editTeacher, setEditTeacher] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/registrations/teachers', {
        params: { search, page, limit: 15 }
      });
      if (res.data.success) {
        setTeachers(res.data.data);
        setTotal(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTeachers();
  };

  const handleSaveEdit = async () => {
    if (!editTeacher) return;
    try {
      const res = await axios.put(`/api/registrations/teachers/${editTeacher._id}`, {
        teacherName: editName,
        phoneNumber: editPhone
      });
      if (res.data.success) {
        setEditTeacher(null);
        fetchTeachers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update teacher.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await axios.delete(`/api/registrations/teachers/${deleteTarget._id}`);
      if (res.data.success) {
        setDeleteTarget(null);
        fetchTeachers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to soft delete teacher.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">TEACHER REGISTRATIONS</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Search and manage all teacher exhibition escorts</p>
        </div>
        <div className="text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl">
          Total Registered: {total}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teacher name, TCH-XXXXXX, or school..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </form>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">Reg ID</th>
                <th className="p-4">Teacher Name</th>
                <th className="p-4">School</th>
                <th className="p-4">Grade</th>
                <th className="p-4">Education Level</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Registered By</th>
                {isAdmin && <th className="p-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">Loading teacher records...</td>
                </tr>
              ) : teachers.length > 0 ? (
                teachers.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50">
                    <td className="p-4 font-extrabold text-emerald-700 font-mono">{t.teacherRegistrationNumber}</td>
                    <td className="p-4 font-bold text-slate-900">{t.teacherName}</td>
                    <td className="p-4 text-slate-700 font-medium">{t.schoolNameSnapshot}</td>
                    <td className="p-4 text-slate-400 font-mono text-xs">N/A</td>
                    <td className="p-4 text-slate-400 font-mono text-xs">N/A</td>
                    <td className="p-4 text-slate-600 font-mono text-xs">{t.phoneNumber || '—'}</td>
                    <td className="p-4 text-xs text-slate-500">{t.registeredByName}</td>
                    {isAdmin && (
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              setEditTeacher(t);
                              setEditName(t.teacherName);
                              setEditPhone(t.phoneNumber || '');
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(t)}
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
                  <td colSpan={8} className="p-8 text-center text-slate-500">No teacher registrations found.</td>
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

      {/* Edit Modal */}
      {editTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Edit Teacher Registration</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
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
              <button onClick={() => setEditTeacher(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
            <h3 className="font-bold text-lg text-slate-900">Soft Delete Teacher?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to soft-delete <strong>{deleteTarget.teacherRegistrationNumber} ({deleteTarget.teacherName})</strong>?
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

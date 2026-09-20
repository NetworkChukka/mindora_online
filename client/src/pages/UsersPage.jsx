import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  UserCog,
  UserPlus,
  Power,
  Pencil,
  Trash2,
  Shield,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New User Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('REGISTRATION_OPERATOR');
  const [createLoading, setCreateLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit User Modal State
  const [editUser, setEditUser] = useState(null);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState('REGISTRATION_OPERATOR');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!fullName || !username || !password) {
      setErrorMsg('All required fields must be filled.');
      return;
    }

    try {
      setCreateLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await axios.post('/api/users', {
        fullName,
        username,
        password,
        role
      });

      if (res.data.success) {
        setSuccessMsg(`User @${res.data.data.username} created successfully.`);
        setFullName('');
        setUsername('');
        setPassword('');
        fetchUsers();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (u) => {
    setEditUser(u);
    setEditFullName(u.fullName || '');
    setEditUsername(u.username || '');
    setEditRole(u.role || 'REGISTRATION_OPERATOR');
    setEditStatus(u.status || 'ACTIVE');
    setEditNewPassword('');
    setEditError('');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      setEditLoading(true);
      setEditError('');

      const payload = {
        fullName: editFullName,
        username: editUsername,
        role: editRole,
        status: editStatus
      };

      if (editNewPassword.trim()) {
        payload.newPassword = editNewPassword.trim();
      }

      const res = await axios.put(`/api/users/${editUser._id}`, payload);
      if (res.data.success) {
        setEditUser(null);
        fetchUsers();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update user profile.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleStatus = async (u) => {
    try {
      const res = await axios.delete(`/api/users/${u._id}`);
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleDeletePermanent = async (u) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE user "@${u.username}" (${u.fullName})?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const res = await axios.delete(`/api/users/${u._id}/permanent`);
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user account.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">OPERATOR & USER ACCOUNTS</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Manage registration operators, admins, and viewers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create User Form Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <span>Create New User</span>
          </h3>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Operator One"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="desk01"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="REGISTRATION_OPERATOR">REGISTRATION_OPERATOR (Register Visitors)</option>
                <option value="ADMIN">ADMIN (Full Control)</option>
                <option value="VIEWER">VIEWER (Read-Only Dashboard)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={createLoading}
              className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-sm shadow transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {createLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>CREATE USER ACCOUNT</span>
              )}
            </button>
          </form>
        </div>

        {/* Users List Table Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <UserCog className="w-5 h-5 text-purple-600" />
              <span>Active Accounts ({users.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Login</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                      Loading user accounts...
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{u.fullName}</div>
                        <div className="text-xs text-slate-500 font-mono">@{u.username}</div>
                      </td>
                      <td className="p-4 font-bold text-xs">
                        <span
                          className={`px-2.5 py-1 rounded-full ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'REGISTRATION_OPERATOR'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {/* Edit User Button */}
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit User Details & Password"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Toggle Status Button */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-2 rounded-lg transition ${
                              u.status === 'ACTIVE'
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.status === 'ACTIVE' ? 'Disable Account' : 'Activate Account'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Permanent Delete Button */}
                          <button
                            onClick={() => handleDeletePermanent(u)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Permanently Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                      No user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                <span>Edit User (@{editUser.username})</span>
              </h3>
              <button
                onClick={() => setEditUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="REGISTRATION_OPERATOR">REGISTRATION_OPERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reset Password <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>
                </label>
                <input
                  type="password"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="New password (optional)"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
                >
                  {editLoading ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

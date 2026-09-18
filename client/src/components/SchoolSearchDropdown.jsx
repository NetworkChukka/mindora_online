import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { Search, Plus, Check, Building2, Loader2 } from 'lucide-react';

export default function SchoolSearchDropdown({ selectedSchool, onSelectSchool, onOpenAddModal }) {
  const { socket } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchSchools = async (query = '') => {
    try {
      setLoading(true);
      const res = await axios.get('/api/schools', {
        params: { search: query, limit: 30 }
      });
      if (res.data.success) {
        setSchools(res.data.data);
      }
    } catch (err) {
      console.error('Failed to search schools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools('');
  }, []);

  // Listen to real-time school:created Socket.IO event from other operators!
  useEffect(() => {
    if (!socket) return;
    const handleSchoolCreated = (newSchool) => {
      setSchools((prev) => {
        if (prev.some((s) => s._id === newSchool._id)) return prev;
        return [newSchool, ...prev];
      });
    };
    socket.on('school:created', handleSchoolCreated);
    return () => socket.off('school:created', handleSchoolCreated);
  }, [socket]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSchools(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        School <span className="text-rose-500">*</span>
      </label>

      {/* Selector Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[52px] px-4 py-2 bg-white border border-slate-300 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-500 focus:outline-none shadow-sm transition"
      >
        {selectedSchool ? (
          <div className="flex items-center space-x-3 overflow-hidden">
            <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="truncate">
              <div className="font-semibold text-slate-900 truncate">{selectedSchool.schoolName}</div>
              {selectedSchool.city && (
                <div className="text-xs text-slate-500">{selectedSchool.city}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-base flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search or select school...</span>
          </div>
        )}
        <span className="text-slate-400 ml-2">▼</span>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-80 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Input inside Dropdown */}
          <div className="p-3 border-b border-slate-100 bg-slate-50 sticky top-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to filter school name..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                autoFocus
              />
            </div>
          </div>

          {/* School List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 text-center text-slate-500 text-sm flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Searching schools...</span>
              </div>
            ) : schools.length > 0 ? (
              schools.map((s) => (
                <div
                  key={s._id}
                  onClick={() => {
                    onSelectSchool(s);
                    setIsOpen(false);
                  }}
                  className={`p-3.5 hover:bg-blue-50 cursor-pointer transition flex items-center justify-between ${
                    selectedSchool?._id === s._id ? 'bg-blue-50/80 font-semibold' : ''
                  }`}
                >
                  <div>
                    <div className="text-sm text-slate-900 font-medium">{s.schoolName}</div>
                    {s.city && <div className="text-xs text-slate-500">{s.city} {s.district ? `(${s.district})` : ''}</div>}
                  </div>
                  {selectedSchool?._id === s._id && (
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center space-y-3">
                <div className="text-slate-500 text-sm font-medium">School not found in central database.</div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAddModal(searchTerm);
                  }}
                  className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ ADD NEW SCHOOL</span>
                </button>
              </div>
            )}
          </div>

          {/* Persistent Footer Button */}
          <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-right">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenAddModal(searchTerm);
              }}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center justify-end space-x-1 w-full text-right"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Can't find school? Add New School</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

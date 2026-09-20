import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { Search, Plus, Check, Building2, Loader2, Trophy, Sparkles } from 'lucide-react';

export default function SchoolSearchDropdown({ selectedSchool, onSelectSchool, onOpenAddModal, lastRegisteredSchool }) {
  const { socket } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [schools, setSchools] = useState([]);
  const [schoolCounts, setSchoolCounts] = useState({}); // { [schoolName]: count }
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch complete schools list AND top school registration counts
  const fetchSchoolsAndStats = async (query = '') => {
    try {
      setLoading(true);
      const [schoolsRes, statsRes] = await Promise.all([
        axios.get('/api/schools', {
          params: { search: query, limit: 2000, status: 'ACTIVE' }
        }),
        axios.get('/api/dashboard/schools').catch(() => ({ data: { success: false } }))
      ]);

      if (statsRes.data?.success && Array.isArray(statsRes.data.data)) {
        const countsMap = {};
        statsRes.data.data.forEach((s) => {
          if (s.schoolName) {
            countsMap[s.schoolName.toLowerCase().trim()] = s.totalVisitors || 0;
          }
        });
        setSchoolCounts(countsMap);
      }

      if (schoolsRes.data?.success) {
        setSchools(schoolsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to search schools or fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolsAndStats('');
  }, []);

  // Instantly bump registration count when local registration completes in parent form
  useEffect(() => {
    if (!lastRegisteredSchool) return;
    const name = lastRegisteredSchool.schoolName || lastRegisteredSchool.schoolNameSnapshot;
    if (name) {
      const key = name.toLowerCase().trim();
      setSchoolCounts((prev) => ({
        ...prev,
        [key]: (prev[key] || 0) + 1
      }));
    }
  }, [lastRegisteredSchool]);

  // Listen to real-time school creation & student/teacher registrations over Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleSchoolCreated = (newSchool) => {
      setSchools((prev) => {
        if (prev.some((s) => s._id === newSchool._id)) return prev;
        return [newSchool, ...prev];
      });
    };

    const handleRegistration = (data) => {
      let schoolName = data?.schoolNameSnapshot || data?.schoolName;
      if (!schoolName && data?.schoolId) {
        const matched = schools.find((s) => s._id === data.schoolId);
        if (matched) schoolName = matched.schoolName;
      }
      if (schoolName) {
        const key = schoolName.toLowerCase().trim();
        setSchoolCounts((prev) => ({
          ...prev,
          [key]: (prev[key] || 0) + 1
        }));
      }
    };

    socket.on('school:created', handleSchoolCreated);
    socket.on('student:registered', handleRegistration);
    socket.on('student:created', handleRegistration);
    socket.on('teacher:registered', handleRegistration);
    socket.on('teacher:created', handleRegistration);

    return () => {
      socket.off('school:created', handleSchoolCreated);
      socket.off('student:registered', handleRegistration);
      socket.off('student:created', handleRegistration);
      socket.off('teacher:registered', handleRegistration);
      socket.off('teacher:created', handleRegistration);
    };
  }, [socket, schools]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSchoolsAndStats(searchTerm);
    }, 200);
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

  // Compute school objects with visitor counts
  const schoolsWithCounts = schools.map((s) => {
    const key = (s.schoolName || '').toLowerCase().trim();
    const count = schoolCounts[key] || 0;
    return { ...s, visitorCount: count };
  });

  // Separate Top Registered Schools (visitorCount > 0, sorted DESC) vs Other Schools (A-Z)
  const topRegisteredSchools = schoolsWithCounts
    .filter((s) => s.visitorCount > 0)
    .sort((a, b) => b.visitorCount - a.visitorCount);

  const otherSchools = schoolsWithCounts
    .filter((s) => s.visitorCount === 0)
    .sort((a, b) => a.schoolName.localeCompare(b.schoolName));

  return (
    <div className="relative w-full space-y-2" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">
          School <span className="text-rose-500">*</span>
        </label>

        {topRegisteredSchools.length > 0 && (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center space-x-1">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span>Top Active Schools First</span>
          </span>
        )}
      </div>

      {/* Quick Select Chips Bar for Top Registered Schools */}
      {topRegisteredSchools.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-shrink-0 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>TOP:</span>
          </span>
          {topRegisteredSchools.slice(0, 5).map((s) => (
            <button
              key={s._id}
              type="button"
              onClick={() => onSelectSchool(s)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center space-x-1.5 flex-shrink-0 border shadow-sm ${
                selectedSchool?._id === s._id
                  ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300'
                  : 'bg-gradient-to-r from-amber-50 to-orange-50 text-slate-800 border-amber-200 hover:border-amber-400 hover:bg-amber-100'
              }`}
            >
              <span className="truncate max-w-[140px]">{s.schoolName}</span>
              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                {s.visitorCount}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Selector Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[52px] px-4 py-2 bg-white border border-slate-300 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-500 focus:outline-none shadow-sm transition"
      >
        {selectedSchool ? (
          <div className="flex items-center space-x-3 overflow-hidden">
            <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="truncate">
              <div className="font-semibold text-slate-900 truncate flex items-center space-x-2">
                <span>{selectedSchool.schoolName}</span>
                {schoolCounts[selectedSchool.schoolName?.toLowerCase().trim()] > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                    {schoolCounts[selectedSchool.schoolName?.toLowerCase().trim()]} registered
                  </span>
                )}
              </div>
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
        <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-96 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Input & Count Header */}
          <div className="p-3 border-b border-slate-100 bg-slate-50 sticky top-0 z-10 space-y-2">
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
            <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between px-1">
              <span>SCHOOL SELECTION LIST</span>
              <span className="text-blue-600 font-extrabold">{schools.length} schools available</span>
            </div>
          </div>

          {/* School List - Full Scrollable Area */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 max-h-64">
            {loading ? (
              <div className="p-6 text-center text-slate-500 text-sm flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading complete school list...</span>
              </div>
            ) : schools.length > 0 ? (
              <>
                {/* Section 1: TOP REGISTERED SCHOOLS (If search is empty or matches) */}
                {topRegisteredSchools.length > 0 && !searchTerm && (
                  <div className="bg-amber-50/60 p-2 text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center space-x-1.5 border-b border-amber-200/60 sticky top-0">
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span>TOP REGISTERED SCHOOLS (MOST ACTIVE FIRST)</span>
                  </div>
                )}

                {topRegisteredSchools.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => {
                      onSelectSchool(s);
                      setIsOpen(false);
                    }}
                    className={`p-3.5 hover:bg-blue-50 cursor-pointer transition flex items-center justify-between ${
                      selectedSchool?._id === s._id ? 'bg-blue-50/90 font-semibold' : ''
                    }`}
                  >
                    <div>
                      <div className="text-sm text-slate-900 font-bold flex items-center space-x-2">
                        <span>{s.schoolName}</span>
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                          {s.visitorCount} registered
                        </span>
                      </div>
                      {s.city && (
                        <div className="text-xs text-slate-500">
                          {s.city} {s.district ? `(${s.district})` : ''}
                        </div>
                      )}
                    </div>
                    {selectedSchool?._id === s._id && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                ))}

                {/* Section 2: OTHER SCHOOLS (A-Z) */}
                {otherSchools.length > 0 && !searchTerm && (
                  <div className="bg-slate-100 p-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200">
                    ALL OTHER SCHOOLS (ALPHABETICAL)
                  </div>
                )}

                {otherSchools.map((s) => (
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
                      {s.city && (
                        <div className="text-xs text-slate-500">
                          {s.city} {s.district ? `(${s.district})` : ''}
                        </div>
                      )}
                    </div>
                    {selectedSchool?._id === s._id && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </>
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

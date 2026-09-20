import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import SchoolSearchDropdown from '../components/SchoolSearchDropdown';
import AddSchoolModal from '../components/AddSchoolModal';
import DuplicateModal from '../components/DuplicateModal';
import { UserPlus, GraduationCap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState('STUDENT'); // 'STUDENT' | 'TEACHER'

  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [grade, setGrade] = useState('10');
  const [phone, setPhone] = useState('');
  const [remarks, setRemarks] = useState('');

  // Teacher Form State
  const [teacherName, setTeacherName] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [retryNotice, setRetryNotice] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [initialSchoolSearch, setInitialSchoolSearch] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const [lastRegisteredSchool, setLastRegisteredSchool] = useState(null);

  const studentNameInputRef = useRef(null);
  const teacherNameInputRef = useRef(null);

  // Auto-focus name field on load or tab switch
  useEffect(() => {
    if (activeTab === 'STUDENT' && studentNameInputRef.current) {
      studentNameInputRef.current.focus();
    } else if (activeTab === 'TEACHER' && teacherNameInputRef.current) {
      teacherNameInputRef.current.focus();
    }
  }, [activeTab]);

  const calculateEducationLevel = (g) => {
    const num = parseInt(g);
    if (num >= 6 && num <= 11) return 'O/L';
    if (num >= 12 && num <= 13) return 'A/L';
    return 'N/A';
  };

  /**
   * Network-resilient POST with automatic retry for high-latency / serverless cold starts
   */
  const postWithRetry = async (url, payload, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) setRetryNotice(true);
        const res = await axios.post(url, payload, { timeout: 12000 });
        setRetryNotice(false);
        return res;
      } catch (err) {
        if (attempt === retries || (err.response && err.response.status !== 503 && err.code !== 'ECONNABORTED')) {
          setRetryNotice(false);
          throw err;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  };

  const handleRegisterStudent = async (e, bypass = false) => {
    if (e) e.preventDefault();
    if (!studentName.trim()) {
      setErrorMsg('Student Name is required.');
      return;
    }
    if (!selectedSchool) {
      setErrorMsg('Please select a school.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await postWithRetry('/api/registrations/students', {
        studentName: studentName.trim(),
        schoolId: selectedSchool._id,
        grade: parseInt(grade),
        phoneNumber: phone.trim(),
        remarks: remarks.trim(),
        bypassDuplicateCheck: bypass
      });

      if (res.data.success) {
        const student = res.data.data;
        setSuccessBanner({
          id: student.registrationNumber,
          type: 'STUDENT',
          name: student.studentName,
          school: student.schoolNameSnapshot,
          level: student.educationLevel
        });

        // Update last registered school to bump top schools list instantly
        setLastRegisteredSchool(student);

        // Reset form & auto-focus
        setStudentName('');
        setPhone('');
        setRemarks('');
        setDuplicateWarning(null);

        setTimeout(() => {
          if (studentNameInputRef.current) {
            studentNameInputRef.current.focus();
          }
        }, 100);
      }
    } catch (err) {
      if (err.response?.data?.warning) {
        setDuplicateWarning(err.response.data.existingRegistration);
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to register student. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterTeacher = async (e, bypass = false) => {
    if (e) e.preventDefault();
    if (!teacherName.trim()) {
      setErrorMsg('Teacher Name is required.');
      return;
    }
    if (!selectedSchool) {
      setErrorMsg('Please select a school.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await postWithRetry('/api/registrations/teachers', {
        teacherName: teacherName.trim(),
        schoolId: selectedSchool._id,
        phoneNumber: phone.trim(),
        remarks: remarks.trim(),
        bypassDuplicateCheck: bypass
      });

      if (res.data.success) {
        const teacher = res.data.data;
        setSuccessBanner({
          id: teacher.teacherRegistrationNumber,
          type: 'TEACHER',
          name: teacher.teacherName,
          school: teacher.schoolNameSnapshot,
          level: 'N/A'
        });

        // Update last registered school to bump top schools list instantly
        setLastRegisteredSchool(teacher);

        // Reset form & auto-focus
        setTeacherName('');
        setPhone('');
        setRemarks('');
        setDuplicateWarning(null);

        setTimeout(() => {
          if (teacherNameInputRef.current) {
            teacherNameInputRef.current.focus();
          }
        }, 100);
      }
    } catch (err) {
      if (err.response?.data?.warning) {
        setDuplicateWarning(err.response.data.existingRegistration);
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to register teacher. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 text-center relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl"></div>
        <div className="text-xs font-bold text-emerald-400 tracking-widest uppercase">
          MINDORA EXHIBITION REGISTRATION
        </div>
        <h1 className="text-2xl font-black tracking-tight mt-1">FAST VISITOR REGISTRATION</h1>
        <p className="text-xs text-slate-400 mt-1">
          Centralized online real-time synchronization across all devices
        </p>
      </div>

      {/* Network Retry Banner */}
      {retryNotice && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center space-x-3 text-sm font-semibold animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin text-amber-600 flex-shrink-0" />
          <span>High network latency detected. Automatically retrying registration...</span>
        </div>
      )}

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="bg-emerald-600 text-white p-5 rounded-2xl shadow-lg animate-in zoom-in-95 duration-150 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
            <div>
              <div className="font-black text-xl tracking-wider">{successBanner.id}</div>
              <div className="text-sm font-semibold opacity-90">
                ✓ {successBanner.type} REGISTERED ({successBanner.name})
              </div>
            </div>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-xs bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-lg font-bold"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center space-x-3 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Registration Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-2 bg-slate-100 border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('STUDENT');
              setErrorMsg('');
            }}
            className={`py-3.5 px-4 rounded-2xl font-extrabold text-base flex items-center justify-center space-x-2 transition ${
              activeTab === 'STUDENT'
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            <span>[ STUDENT ]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('TEACHER');
              setErrorMsg('');
            }}
            className={`py-3.5 px-4 rounded-2xl font-extrabold text-base flex items-center justify-center space-x-2 transition ${
              activeTab === 'TEACHER'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span>[ TEACHER ]</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Shared School Selector */}
          <SchoolSearchDropdown
            selectedSchool={selectedSchool}
            onSelectSchool={(school) => setSelectedSchool(school)}
            onOpenAddModal={(searchQuery) => {
              setInitialSchoolSearch(searchQuery);
              setAddModalOpen(true);
            }}
            lastRegisteredSchool={lastRegisteredSchool}
          />

          {/* STUDENT FORM */}
          {activeTab === 'STUDENT' && (
            <form onSubmit={(e) => handleRegisterStudent(e, false)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={studentNameInputRef}
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Kasun Kalhara"
                  className="input-field font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Grade <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="input-field font-bold cursor-pointer"
                  >
                    {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Education Level
                  </label>
                  <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-black text-base text-blue-800 flex items-center justify-between">
                    <span>{calculateEducationLevel(grade)}</span>
                    <span className="text-xs text-slate-500 font-normal">
                      {parseInt(grade) <= 11 ? 'Grades 6–11' : 'Grades 12–13'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-xs text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0771234567"
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>REGISTERING STUDENT...</span>
                  </>
                ) : (
                  <span>REGISTER STUDENT</span>
                )}
              </button>
            </form>
          )}

          {/* TEACHER FORM */}
          {activeTab === 'TEACHER' && (
            <form onSubmit={(e) => handleRegisterTeacher(e, false)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Teacher Name <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={teacherNameInputRef}
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="e.g. Mrs. Nimali Wijesinghe"
                  className="input-field font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-xs text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0771234567"
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg transition transform active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>REGISTERING TEACHER...</span>
                  </>
                ) : (
                  <span>REGISTER TEACHER</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <AddSchoolModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        initialName={initialSchoolSearch}
        onSchoolCreated={(newSchool) => {
          setSelectedSchool(newSchool);
        }}
      />

      <DuplicateModal
        isOpen={!!duplicateWarning}
        existingRegistration={duplicateWarning}
        onCancel={() => setDuplicateWarning(null)}
        onRegisterAnyway={() => {
          if (activeTab === 'STUDENT') {
            handleRegisterStudent(null, true);
          } else {
            handleRegisterTeacher(null, true);
          }
        }}
      />
    </div>
  );
}

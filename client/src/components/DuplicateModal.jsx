import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DuplicateModal({ isOpen, existingRegistration, onRegisterAnyway, onCancel }) {
  if (!isOpen || !existingRegistration) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-amber-200">
        <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-center space-x-3 text-amber-900">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <h3 className="font-bold text-base">Possible Duplicate Registration Found</h3>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            A visitor with a matching name and school is already registered in the central system:
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-medium text-sm text-slate-800">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Existing Record</div>
            <div className="font-bold text-blue-700 text-base">
              {existingRegistration.registrationNumber}
            </div>
            <div>Name: <span className="font-semibold">{existingRegistration.studentName || existingRegistration.teacherName}</span></div>
            <div>School: <span className="font-semibold">{existingRegistration.schoolName}</span></div>
            {existingRegistration.grade && <div>Grade: <span className="font-semibold">{existingRegistration.grade}</span></div>}
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
            >
              CANCEL
            </button>
            <button
              onClick={onRegisterAnyway}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow transition"
            >
              REGISTER ANYWAY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [eventName, setEventName] = useState('MINDORA');
  const [subtitle, setSubtitle] = useState('MICROBIOLOGY EXHIBITION');
  const [eventDate, setEventDate] = useState('2026-09-18');
  const [venue, setVenue] = useState('University Faculty Grounds');
  const [studentPrefix, setStudentPrefix] = useState('MIN');
  const [teacherPrefix, setTeacherPrefix] = useState('TCH');
  const [duplicateDetection, setDuplicateDetection] = useState(true);
  const [eventDayMode, setEventDayMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get('/api/settings').then((res) => {
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        setEventName(d.eventName || 'MINDORA');
        setSubtitle(d.subtitle || 'MICROBIOLOGY EXHIBITION');
        setEventDate(d.eventDate || '');
        setVenue(d.venue || '');
        setStudentPrefix(d.studentPrefix || 'MIN');
        setTeacherPrefix(d.teacherPrefix || 'TCH');
        setDuplicateDetection(d.duplicateDetection ?? true);
        setEventDayMode(d.eventDayMode ?? false);
      }
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.put('/api/settings', {
        eventName,
        subtitle,
        eventDate,
        venue,
        studentPrefix,
        teacherPrefix,
        duplicateDetection,
        eventDayMode
      });
      if (res.data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      alert('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">EVENT & SYSTEM SETTINGS</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Configure exhibition identity, prefixes, and event-day operational modes</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-2 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Event settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Event Name</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Student Prefix</label>
            <input
              type="text"
              value={studentPrefix}
              onChange={(e) => setStudentPrefix(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Prefix</label>
            <input
              type="text"
              value={teacherPrefix}
              onChange={(e) => setTeacherPrefix(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={duplicateDetection}
              onChange={(e) => setDuplicateDetection(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <div>
              <div className="text-sm font-bold text-slate-900">Enable Possible Duplicate Warnings</div>
              <div className="text-xs text-slate-500">Alerts operators if same name and school are registered</div>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-base rounded-2xl shadow-lg transition flex items-center justify-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>SAVE EVENT SETTINGS</span>
        </button>
      </form>
    </div>
  );
}

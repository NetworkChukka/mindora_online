import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const colorStyles = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900 icon-bg:bg-blue-600',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-900 icon-bg:bg-emerald-600',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900 icon-bg:bg-indigo-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-900 icon-bg:bg-amber-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-900 icon-bg:bg-purple-600'
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{title}</div>
          <div className="text-3xl font-extrabold text-slate-900">{value ?? 0}</div>
          {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-2xl text-white shadow-md ${
            color === 'green' ? 'bg-emerald-600' :
            color === 'indigo' ? 'bg-indigo-600' :
            color === 'amber' ? 'bg-amber-600' :
            color === 'purple' ? 'bg-purple-600' : 'bg-blue-600'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}

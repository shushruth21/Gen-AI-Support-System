import React from 'react';

export function StatCard({ title, value, icon, description }: { title: string, value: string | number, icon?: React.ReactNode, description?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
  );
}

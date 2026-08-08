
import React from 'react';

const ChartCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
    <h3 className="text-sm font-bold text-slate-700 mb-4">{title}</h3>
    {children}
  </div>
);

export default ChartCard;

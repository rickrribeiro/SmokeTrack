
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SmokingRecord } from '../../types';
import { computeNoteStats } from '../../util/analytics';
import { CHART_COLORS } from '../../constants';
import ChartCard from './ChartCard';

interface NotesCardProps {
  filteredRecords: SmokingRecord[];
}

const NotesCard: React.FC<NotesCardProps> = ({ filteredRecords }) => {
  const noteData = useMemo(() => computeNoteStats(filteredRecords), [filteredRecords]);

  return (
    <ChartCard title="Notas mais Frequentes">
      {noteData.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-6">Nenhuma nota registrada no período.</p>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <ResponsiveContainer width="100%" height={220} minWidth={Math.max(320, noteData.length * 70)}>
            <BarChart data={noteData} margin={{ bottom: 30 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={50} />
              <YAxis hide />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {noteData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
};

export default NotesCard;

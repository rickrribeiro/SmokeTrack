
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SmokingRecord } from '../../types';
import { computeMoodStats, getMoodInsight } from '../../util/analytics';
import { CHART_COLORS } from '../../constants';
import ChartCard from './ChartCard';

interface MoodCardProps {
  filteredRecords: SmokingRecord[];
}

const MoodCard: React.FC<MoodCardProps> = ({ filteredRecords }) => {
  const stats = useMemo(() => computeMoodStats(filteredRecords), [filteredRecords]);
  const insight = useMemo(() => getMoodInsight(stats), [stats]);
  const hasData = stats.some(s => s.count > 0);

  const chartData = useMemo(
    () => stats.map(s => ({ name: `${s.emoji} ${s.label}`, count: s.count })),
    [stats]
  );

  return (
    <ChartCard title="Consumo por Humor">
      {!hasData ? (
        <p className="text-slate-400 text-sm text-center py-6">Nenhum registro com humor marcado no período.</p>
      ) : (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {insight && (
            <p className="text-xs text-slate-600 bg-slate-50 rounded-2xl px-4 py-3">{insight}</p>
          )}
        </div>
      )}
    </ChartCard>
  );
};

export default MoodCard;

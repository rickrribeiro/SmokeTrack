
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SmokingRecord, filterStrategies } from '../../types';
import { buildDayOfWeekData } from '../../util/analytics';
import { CHART_COLORS } from '../../constants';
import ChartCard from './ChartCard';

interface DayOfWeekCardProps {
  filteredRecords: SmokingRecord[];
  strategyFilter: filterStrategies;
}

const DayOfWeekCard: React.FC<DayOfWeekCardProps> = ({ filteredRecords, strategyFilter }) => {
  const dowData = useMemo(() => buildDayOfWeekData(filteredRecords, strategyFilter), [filteredRecords, strategyFilter]);

  return (
    <ChartCard title={`Fumo por Dia da Semana (${strategyFilter})`}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={dowData}>
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis hide />
          <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {dowData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default DayOfWeekCard;

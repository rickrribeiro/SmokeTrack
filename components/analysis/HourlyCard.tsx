
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SmokingRecord, filterStrategies } from '../../types';
import { buildHourlyData } from '../../util/analytics';
import ChartCard from './ChartCard';

interface HourlyCardProps {
  filteredRecords: SmokingRecord[];
  strategyFilter: filterStrategies;
}

const HourlyCard: React.FC<HourlyCardProps> = ({ filteredRecords, strategyFilter }) => {
  const hourlyData = useMemo(() => buildHourlyData(filteredRecords, strategyFilter), [filteredRecords, strategyFilter]);

  return (
    <ChartCard title={`Fumo por Horário (${strategyFilter})`}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={hourlyData}>
          <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis hide />
          <Tooltip cursor={{ fill: 'transparent' }} />
          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default HourlyCard;

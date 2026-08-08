
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SmokingRecord } from '../../types';
import { buildDailyTrend } from '../../util/analytics';
import ChartCard from './ChartCard';

interface DailyTrendCardProps {
  filteredRecords: SmokingRecord[];
}

const DailyTrendCard: React.FC<DailyTrendCardProps> = ({ filteredRecords }) => {
  const dailyData = useMemo(() => buildDailyTrend(filteredRecords), [filteredRecords]);

  return (
    <ChartCard title="Fumo por Dia">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={dailyData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          />
          <Line type="monotone" dataKey="count" name="Diário" stroke="#a5b4fc" strokeWidth={1} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="movingAvg" name="Média 7d" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default DailyTrendCard;

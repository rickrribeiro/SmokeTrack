
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SmokingRecord } from '../../types';
import { buildTypeData } from '../../util/analytics';
import { CHART_COLORS } from '../../constants';
import ChartCard from './ChartCard';

interface TypeCardProps {
  filteredRecords: SmokingRecord[];
}

const TypeCard: React.FC<TypeCardProps> = ({ filteredRecords }) => {
  const typeData = useMemo(() => buildTypeData(filteredRecords).slice(0, 5), [filteredRecords]);

  return (
    <ChartCard title="Por Tipo de Fumo">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={typeData}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis hide />
          <Tooltip cursor={{ fill: 'transparent' }} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {typeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TypeCard;


import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SmokingRecord } from '../../types';
import { buildActivityData } from '../../util/analytics';
import { CHART_COLORS } from '../../constants';
import ChartCard from './ChartCard';

interface ActivityCardProps {
  filteredRecords: SmokingRecord[];
}

const ActivityCard: React.FC<ActivityCardProps> = ({ filteredRecords }) => {
  // NOTA: a versão anterior deste gráfico colorida as barras usando os dados de
  // "Por Tipo de Fumo" por engano (bug pré-existente). Extraído isoladamente, o
  // componente só tem acesso aos próprios dados, corrigindo o bug naturalmente.
  const activityData = useMemo(() => buildActivityData(filteredRecords).slice(0, 5), [filteredRecords]);

  return (
    <ChartCard title="Fumo por Atividade">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart layout="vertical" data={activityData}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fill: '#64748b', fontSize: 10 }} />
          <Tooltip cursor={{ fill: 'transparent' }} />
          <Bar dataKey="count" fill="#818cf8" radius={[0, 8, 8, 0]}>
            {activityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ActivityCard;

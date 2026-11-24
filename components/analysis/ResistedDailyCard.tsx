import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ResistedDayPoint } from '../../util/resisted';
import ChartCard from './ChartCard';

interface ResistedDailyCardProps {
  daily: ResistedDayPoint[];
}

const BAR_COLOR = '#059669'; // emerald-600, mesma família do feedback da tela de abertura

const ResistedDailyCard: React.FC<ResistedDailyCardProps> = ({ daily }) => (
  <ChartCard title="Vontades Seguradas por Dia">
    {daily.length === 0 ? (
      <p className="text-sm text-slate-400 py-6 text-center">
        Nenhuma vontade segurada neste recorte. Toque em "Não, vou segurar" na tela de abertura para começar a contar.
      </p>
    ) : (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={daily} barCategoryGap={2}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} minTickGap={8} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={28} />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            itemStyle={{ color: '#334155' }}
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey="count" name="Seguradas" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </ChartCard>
);

export default ResistedDailyCard;

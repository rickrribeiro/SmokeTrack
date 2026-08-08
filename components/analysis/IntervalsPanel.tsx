
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SmokingRecord } from '../../types';
import { computeIntervalsMs, computeIntervalStats, bucketIntervals } from '../../util/analytics';
import { formatDuration } from '../../util/duration';
import ChartCard from './ChartCard';

interface IntervalsPanelProps {
  filteredRecords: SmokingRecord[];
}

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-50 rounded-2xl py-3">
    <div className="text-base font-bold text-slate-800">{value}</div>
    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">{label}</div>
  </div>
);

const IntervalsPanel: React.FC<IntervalsPanelProps> = ({ filteredRecords }) => {
  const intervalsMs = useMemo(() => computeIntervalsMs(filteredRecords), [filteredRecords]);
  const stats = useMemo(() => computeIntervalStats(intervalsMs), [intervalsMs]);
  const buckets = useMemo(() => bucketIntervals(intervalsMs), [intervalsMs]);

  return (
    <ChartCard title="Intervalos entre Registros">
      {!stats ? (
        <p className="text-slate-400 text-sm text-center py-6">Registros insuficientes no período para calcular intervalos.</p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Média" value={formatDuration(stats.avgMs)} />
            <Stat label="Mediana" value={formatDuration(stats.medianMs)} />
            <Stat label="P90" value={formatDuration(stats.p90Ms)} />
            <Stat label="Menor" value={formatDuration(stats.minMs)} />
            <Stat label="Maior" value={formatDuration(stats.maxMs)} />
            <Stat label="Total" value={`${stats.count}`} />
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <ResponsiveContainer width="100%" height={200} minWidth={360}>
              <BarChart data={buckets} margin={{ bottom: 20 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={40} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </ChartCard>
  );
};

export default IntervalsPanel;

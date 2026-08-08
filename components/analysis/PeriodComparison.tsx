
import React, { useMemo } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { SmokingRecord, FilterRange, filterDays } from '../../types';
import { computeComparison, ComparisonMetric } from '../../util/analytics';
import { formatDuration } from '../../util/duration';
import ChartCard from './ChartCard';

interface PeriodComparisonProps {
  records: SmokingRecord[];
  periodo: FilterRange;
  daysFilter: filterDays;
}

const trendColor = (trend: ComparisonMetric['trend']) => {
  if (trend === 'down') return 'text-emerald-600';
  if (trend === 'up') return 'text-red-500';
  return 'text-slate-400';
};

const TrendIcon: React.FC<{ trend: ComparisonMetric['trend'] }> = ({ trend }) => {
  if (trend === 'down') return <TrendingDown size={14} />;
  if (trend === 'up') return <TrendingUp size={14} />;
  return <Minus size={14} />;
};

const formatPct = (m: ComparisonMetric) => {
  if (m.diffPct === null) return '—';
  const pct = (m.diffPct * 100).toFixed(0);
  const sign = m.diffPct > 0 ? '+' : '';
  return `${sign}${pct}%`;
};

const MetricRow: React.FC<{ label: string; metric: ComparisonMetric; format: (v: number) => string }> = ({ label, metric, format }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-xs font-medium text-slate-500">{label}</span>
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold text-slate-800">{format(metric.current)}</span>
      <span className={`flex items-center gap-1 text-xs font-bold ${trendColor(metric.trend)}`}>
        <TrendIcon trend={metric.trend} /> {formatPct(metric)}
      </span>
    </div>
  </div>
);

const PeriodComparison: React.FC<PeriodComparisonProps> = ({ records, periodo, daysFilter }) => {
  const comparison = useMemo(() => computeComparison(records, periodo, daysFilter), [records, periodo, daysFilter]);

  return (
    <ChartCard title="Comparação com Período Anterior">
      {!comparison ? (
        <p className="text-slate-400 text-sm text-center py-6">
          Comparação disponível apenas para períodos com duração fixa (não é possível para "Total").
        </p>
      ) : (
        <div>
          <MetricRow label="Total de Registros" metric={comparison.totalRecords} format={v => v.toFixed(0)} />
          <MetricRow label="Média Diária" metric={comparison.dailyAverage} format={v => v.toFixed(2)} />
          <MetricRow label="Média Dias Úteis" metric={comparison.weekdayAverage} format={v => v.toFixed(2)} />
          <MetricRow label="Média Fim de Semana" metric={comparison.weekendAverage} format={v => v.toFixed(2)} />
          <MetricRow label="Intervalo Médio" metric={comparison.avgIntervalMs} format={v => formatDuration(v)} />
        </div>
      )}
    </ChartCard>
  );
};

export default PeriodComparison;

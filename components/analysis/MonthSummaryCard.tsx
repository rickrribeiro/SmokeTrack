
import React, { useMemo } from 'react';
import { SmokingRecord, filterDays } from '../../types';
import { computeMonthSummary } from '../../util/analytics';
import { formatMonthLabel } from '../../util/months';
import { formatDuration } from '../../util/duration';
import ChartCard from './ChartCard';

interface MonthSummaryCardProps {
  records: SmokingRecord[];
  monthKey: string;
  daysFilter: filterDays;
}

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-50 rounded-2xl py-3">
    <div className="text-base font-bold text-slate-800">{value}</div>
    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">{label}</div>
  </div>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-xs font-medium text-slate-500">{label}</span>
    <span className="text-sm font-bold text-slate-800">{value}</span>
  </div>
);

const formatDay = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const formatNumber = (value: number) => value.toFixed(2).replace('.', ',');

const MonthSummaryCard: React.FC<MonthSummaryCardProps> = ({ records, monthKey, daysFilter }) => {
  const summary = useMemo(() => computeMonthSummary(records, monthKey, daysFilter), [records, monthKey, daysFilter]);
  const label = formatMonthLabel(monthKey);

  return (
    <ChartCard title={`Resumo de ${label}`}>
      {summary.totalRecords === 0 ? (
        <p className="text-slate-400 text-sm text-center py-6">Nenhum registro em {label} com os filtros atuais.</p>
      ) : (
        <div className="space-y-5">
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600">{summary.totalRecords}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              registros em {summary.calendarDays} {summary.calendarDays === 1 ? 'dia' : 'dias'}
              {summary.inProgress && ' (mês em andamento)'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Média / dia" value={formatNumber(summary.avgPerCalendarDay)} />
            <Stat label="Média / dia com registro" value={formatNumber(summary.avgPerActiveDay)} />
            <Stat label="Dias sem fumar" value={`${summary.daysWithoutRecords}`} />
            <Stat label="Dias com registro" value={`${summary.daysWithRecords}`} />
            <Stat label="Intervalo médio" value={formatDuration(summary.avgIntervalMs)} />
            <Stat label="Maior intervalo" value={summary.longestGapMs === null ? '—' : formatDuration(summary.longestGapMs)} />
          </div>

          <div>
            <Row label="Média Dias Úteis" value={formatNumber(summary.weekdayAverage)} />
            <Row label="Média Fim de Semana" value={formatNumber(summary.weekendAverage)} />
            <Row
              label="Dia mais intenso"
              value={summary.busiestDay ? `${formatDay(summary.busiestDay.date)} · ${summary.busiestDay.count}` : '—'}
            />
            <Row
              label="Atividade mais frequente"
              value={summary.topActivity ? `${summary.topActivity.name} · ${summary.topActivity.count}` : '—'}
            />
            <Row
              label="Tipo mais frequente"
              value={summary.topType ? `${summary.topType.name} · ${summary.topType.count}` : '—'}
            />
          </div>
        </div>
      )}
    </ChartCard>
  );
};

export default MonthSummaryCard;

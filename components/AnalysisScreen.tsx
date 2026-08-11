
import React, { useMemo, useState } from 'react';
import { SmokingRecord, FilterRange, filterDays, filterStrategies, AnalysisMode, AnalysisSelection } from '../types';
import { PERIODS, FILTER_STRATEGIES, FILTER_DAYS, ANALYSIS_MODE_LABELS } from '../constants';
import { getAvailableMonthKeys, getMonthKey, formatMonthLabel } from '../util/months';
import { useFilteredRecords } from './analysis/useFilteredRecords';
import MonthSummaryCard from './analysis/MonthSummaryCard';
import AveragesPanel from './analysis/AveragesPanel';
import DailyTrendCard from './analysis/DailyTrendCard';
import DayOfWeekCard from './analysis/DayOfWeekCard';
import HourlyCard from './analysis/HourlyCard';
import ActivityCard from './analysis/ActivityCard';
import TypeCard from './analysis/TypeCard';
import IntervalsPanel from './analysis/IntervalsPanel';
import LongestGapCard from './analysis/LongestGapCard';
import HourDayHeatmap from './analysis/HourDayHeatmap';
import TriggersPanel from './analysis/TriggersPanel';
import MoodCard from './analysis/MoodCard';
import NotesCard from './analysis/NotesCard';
import PeriodComparison from './analysis/PeriodComparison';
import ConsumptionCalendar from './analysis/ConsumptionCalendar';
import DayTimeline from './analysis/DayTimeline';

interface AnalysisScreenProps {
  records: SmokingRecord[];
}

const SELECT_CLASS = 'w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none';

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ records }) => {
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.PERIOD);
  const [periodo, setPeriodo] = useState<FilterRange>(FilterRange.DAYS_7);
  const [daysFilter, setDaysFilter] = useState<filterDays>(filterDays.TOTAL);
  const [strategyFilter, setStrategyFilter] = useState<filterStrategies>(filterStrategies.TOTAL);
  const [month, setMonth] = useState<string>(() => getMonthKey(new Date()));

  const monthOptions = useMemo(() => getAvailableMonthKeys(records), [records]);
  // Se o mês guardado deixar de existir (ex.: registros apagados), cai no mais recente disponível.
  const selectedMonth = monthOptions.includes(month) ? month : monthOptions[0];

  const selection = useMemo<AnalysisSelection>(
    () => mode === AnalysisMode.MONTH
      ? { mode: AnalysisMode.MONTH, month: selectedMonth }
      : { mode: AnalysisMode.PERIOD, periodo },
    [mode, selectedMonth, periodo]
  );

  const { filteredRecords, periodOnlyRecords } = useFilteredRecords(records, selection, daysFilter);

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div id="filters" className="space-y-1">
        <section className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md pt-2 pb-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Recorte da Análise</label>
          <div className="flex gap-1 bg-slate-200/70 p-1 rounded-2xl mb-2" role="group" aria-label="Recorte da análise">
            {(Object.values(AnalysisMode) as AnalysisMode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors ${mode === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                {ANALYSIS_MODE_LABELS[m]}
              </button>
            ))}
          </div>
          {mode === AnalysisMode.PERIOD ? (
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as FilterRange)}
              aria-label="Período de análise"
              className={SELECT_CLASS}
            >
              {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          ) : (
            <select
              value={selectedMonth}
              onChange={(e) => setMonth(e.target.value)}
              aria-label="Mês de análise"
              className={SELECT_CLASS}
            >
              {monthOptions.map(key => <option key={key} value={key}>{formatMonthLabel(key)}</option>)}
            </select>
          )}
        </section>
        <section className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md pt-2 pb-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Dias de Análise</label>
          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(e.target.value as filterDays)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {FILTER_DAYS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </section>
        <section className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md pt-2 pb-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Estratégia Análise</label>
          <select
            value={strategyFilter}
            onChange={(e) => setStrategyFilter(e.target.value as filterStrategies)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {FILTER_STRATEGIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </section>
      </div>

      <div className="space-y-6">
        {mode === AnalysisMode.MONTH && (
          <MonthSummaryCard records={records} monthKey={selectedMonth} daysFilter={daysFilter} />
        )}
        <AveragesPanel filteredRecords={filteredRecords} periodOnlyRecords={periodOnlyRecords} />
        <DailyTrendCard filteredRecords={filteredRecords} />
        <IntervalsPanel filteredRecords={filteredRecords} />
        <LongestGapCard filteredRecords={filteredRecords} />
        <DayOfWeekCard filteredRecords={filteredRecords} strategyFilter={strategyFilter} />
        <HourlyCard filteredRecords={filteredRecords} strategyFilter={strategyFilter} />
        <HourDayHeatmap filteredRecords={filteredRecords} />
        <TriggersPanel filteredRecords={filteredRecords} />
        <ActivityCard filteredRecords={filteredRecords} />
        <TypeCard filteredRecords={filteredRecords} />
        <MoodCard filteredRecords={filteredRecords} />
        <NotesCard filteredRecords={filteredRecords} />
        <PeriodComparison records={records} selection={selection} daysFilter={daysFilter} />

        <div className="pt-2 pb-1 px-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visões Independentes dos Filtros</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Calendário e linha do tempo sempre mostram o histórico completo, sem aplicar os filtros acima.</p>
        </div>
        <ConsumptionCalendar records={records} />
        <DayTimeline records={records} />
      </div>
    </div>
  );
};

export default AnalysisScreen;

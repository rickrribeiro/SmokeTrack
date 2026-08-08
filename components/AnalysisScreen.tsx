
import React, { useState } from 'react';
import { SmokingRecord, FilterRange, filterDays, filterStrategies } from '../types';
import { PERIODS, FILTER_STRATEGIES, FILTER_DAYS } from '../constants';
import { useFilteredRecords } from './analysis/useFilteredRecords';
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

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ records }) => {
  const [periodo, setPeriodo] = useState<FilterRange>(FilterRange.DAYS_7);
  const [daysFilter, setDaysFilter] = useState<filterDays>(filterDays.TOTAL);
  const [strategyFilter, setStrategyFilter] = useState<filterStrategies>(filterStrategies.TOTAL);

  const { filteredRecords, periodOnlyRecords } = useFilteredRecords(records, periodo, daysFilter);

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div id="filters" className="space-y-1">
        <section className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md pt-2 pb-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Período de Análise</label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as FilterRange)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
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
        <PeriodComparison records={records} periodo={periodo} daysFilter={daysFilter} />

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

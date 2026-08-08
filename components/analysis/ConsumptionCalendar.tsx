
import React, { useMemo, useState } from 'react';
import { getDay } from 'date-fns';
import { SmokingRecord } from '../../types';
import { buildCalendarHeatmapData, CalendarDay } from '../../util/analytics';
import ChartCard from './ChartCard';

interface ConsumptionCalendarProps {
  records: SmokingRecord[];
}

const PALETTE = ['#f1f5f9', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'];
const colorForLevel = (level: number) => PALETTE[level];

const ConsumptionCalendar: React.FC<ConsumptionCalendarProps> = ({ records }) => {
  const [hovered, setHovered] = useState<CalendarDay | null>(null);

  // Independe dos filtros de análise: sempre os últimos 365 dias.
  const weeks = useMemo(() => {
    const days = buildCalendarHeatmapData(records, 365);
    if (days.length === 0) return [];
    const firstDow = getDay(new Date(days[0].date + 'T00:00:00'));
    const padded: (CalendarDay | null)[] = [...Array(firstDow).fill(null), ...days];
    const result: (CalendarDay | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      result.push(padded.slice(i, i + 7));
    }
    return result;
  }, [records]);

  const hasData = records.length > 0;

  return (
    <ChartCard title="Calendário de Consumo">
      {!hasData ? (
        <p className="text-slate-400 text-sm text-center py-6">Sem registros ainda.</p>
      ) : (
        <div className="space-y-2">
          <div className="overflow-x-auto custom-scrollbar pb-1">
            <div className="inline-grid grid-flow-col gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid gap-[3px]" style={{ gridTemplateRows: 'repeat(7, 1fr)' }}>
                  {week.map((day, di) => (
                    <div
                      key={di}
                      onMouseEnter={() => day && setHovered(day)}
                      onMouseLeave={() => setHovered(null)}
                      title={day ? `${day.date} — ${day.count} registro(s)` : undefined}
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: day ? colorForLevel(day.level) : 'transparent' }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[10px] text-slate-400">
              {hovered ? `${hovered.date} — ${hovered.count} registro(s)` : 'Últimos 365 dias'}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400">menos</span>
              {PALETTE.map((c, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
              ))}
              <span className="text-[9px] text-slate-400">mais</span>
            </div>
          </div>
        </div>
      )}
    </ChartCard>
  );
};

export default ConsumptionCalendar;

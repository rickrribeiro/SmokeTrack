
import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SmokingRecord } from '../../types';
import { buildDayTimelineData, TimelineRecord } from '../../util/analytics';
import { MOOD_OPTIONS } from '../../constants';
import ChartCard from './ChartCard';

interface DayTimelineProps {
  records: SmokingRecord[];
}

const formatDateLabel = (date: Date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' });

const DayTimeline: React.FC<DayTimelineProps> = ({ records }) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [hovered, setHovered] = useState<TimelineRecord | null>(null);

  // Independe dos filtros de análise: mostra os registros do dia selecionado.
  const dayRecords = useMemo(() => buildDayTimelineData(records, selectedDate), [records, selectedDate]);

  const shiftDay = (delta: number) => {
    setSelectedDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  };

  const moodEmoji = (mood?: SmokingRecord['mood']) => MOOD_OPTIONS.find(m => m.value === mood)?.emoji;

  return (
    <ChartCard title="Linha do Tempo do Dia">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => shiftDay(-1)} className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:text-indigo-600 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-bold text-slate-700 capitalize">{formatDateLabel(selectedDate)}</span>
          <button onClick={() => shiftDay(1)} className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:text-indigo-600 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {dayRecords.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">Nenhum registro neste dia.</p>
        ) : (
          <div className="space-y-2">
            <div className="relative h-10 bg-slate-50 rounded-xl">
              {dayRecords.map(r => (
                <div
                  key={r.id}
                  onMouseEnter={() => setHovered(r)}
                  onMouseLeave={() => setHovered(null)}
                  title={`${new Date(r.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${r.smokeType} • ${r.activity}`}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow cursor-pointer"
                  style={{ left: `${(r.hourFraction / 24) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 px-0.5">
              <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>24h</span>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 rounded-2xl px-4 py-3 min-h-[2.5rem] flex items-center">
              {hovered
                ? `${new Date(hovered.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${hovered.smokeType} • ${hovered.activity}${moodEmoji(hovered.mood) ? ' • ' + moodEmoji(hovered.mood) : ''}${hovered.note ? ' • ' + hovered.note : ''}`
                : `${dayRecords.length} registro(s) neste dia — toque em um marcador para ver detalhes`}
            </p>
          </div>
        )}
      </div>
    </ChartCard>
  );
};

export default DayTimeline;

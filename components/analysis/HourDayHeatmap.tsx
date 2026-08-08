
import React, { useMemo, useState } from 'react';
import { SmokingRecord } from '../../types';
import { computeHourDayHeatmap } from '../../util/analytics';
import ChartCard from './ChartCard';

interface HourDayHeatmapProps {
  filteredRecords: SmokingRecord[];
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const PALETTE = ['#f1f5f9', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'];

const colorFor = (count: number, max: number) => {
  if (count === 0) return PALETTE[0];
  const level = Math.min(4, Math.ceil((count / max) * 4));
  return PALETTE[level];
};

const HourDayHeatmap: React.FC<HourDayHeatmapProps> = ({ filteredRecords }) => {
  const { matrix, max } = useMemo(() => computeHourDayHeatmap(filteredRecords), [filteredRecords]);
  const [hovered, setHovered] = useState<{ day: number; hour: number; count: number } | null>(null);
  const hasData = filteredRecords.length > 0;

  return (
    <ChartCard title="Heatmap Hora x Dia da Semana">
      {!hasData ? (
        <p className="text-slate-400 text-sm text-center py-6">Sem registros no período.</p>
      ) : (
        <div className="space-y-2">
          <div className="overflow-x-auto custom-scrollbar">
            <div className="inline-grid gap-[3px]" style={{ gridTemplateColumns: '28px repeat(24, 16px)' }}>
              <div />
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="text-[8px] text-slate-400 text-center">{h % 3 === 0 ? h : ''}</div>
              ))}
              {matrix.map((row, day) => (
                <React.Fragment key={day}>
                  <div className="text-[9px] font-semibold text-slate-400 flex items-center">{DAY_LABELS[day]}</div>
                  {row.map((count, hour) => (
                    <div
                      key={hour}
                      onMouseEnter={() => setHovered({ day, hour, count })}
                      onMouseLeave={() => setHovered(null)}
                      title={`${DAY_LABELS[day]} ${hour}h — ${count} registro(s)`}
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: colorFor(count, max) }}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 h-4">
            {hovered ? `${DAY_LABELS[hovered.day]} ${hovered.hour}h — ${hovered.count} registro(s)` : 'Passe o mouse sobre uma célula'}
          </p>
        </div>
      )}
    </ChartCard>
  );
};

export default HourDayHeatmap;

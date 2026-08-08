
import React, { useMemo } from 'react';
import { SmokingRecord } from '../../types';
import { computeTriggerAnalysis } from '../../util/analytics';
import ChartCard from './ChartCard';

interface TriggersPanelProps {
  filteredRecords: SmokingRecord[];
}

const formatMultiplier = (m: number) => `${m.toFixed(1).replace('.', ',')}×`;

const TriggersPanel: React.FC<TriggersPanelProps> = ({ filteredRecords }) => {
  const triggers = useMemo(() => computeTriggerAnalysis(filteredRecords), [filteredRecords]);

  return (
    <ChartCard title="Gatilhos mais Frequentes">
      {triggers.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-6">Dados insuficientes no período para identificar gatilhos.</p>
      ) : (
        <div className="space-y-3">
          {triggers.map((t, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-800 text-sm">{t.activity} • {t.hourBucketLabel}</div>
                <div className="text-xs text-slate-500">{t.topDays.join(', ')} • {t.count} ocorrências</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-indigo-600">{formatMultiplier(t.multiplier)}</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wide">acima da média</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  );
};

export default TriggersPanel;

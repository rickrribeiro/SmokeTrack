
import React, { useMemo } from 'react';
import { SmokingRecord } from '../../types';
import { findLongestGap } from '../../util/analytics';
import { formatDuration } from '../../util/duration';
import ChartCard from './ChartCard';

interface LongestGapCardProps {
  filteredRecords: SmokingRecord[];
}

const formatDateTime = (iso: string) => new Date(iso).toLocaleString('pt-BR', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
});

const LongestGapCard: React.FC<LongestGapCardProps> = ({ filteredRecords }) => {
  // Só entre registros já existentes no período — nunca compara contra o momento atual.
  const gap = useMemo(() => findLongestGap(filteredRecords), [filteredRecords]);

  return (
    <ChartCard title="Maior Intervalo sem Fumar">
      {!gap ? (
        <p className="text-slate-400 text-sm text-center py-6">Registros insuficientes no período.</p>
      ) : (
        <div className="text-center py-2">
          <div className="text-3xl font-bold text-indigo-600">{formatDuration(gap.ms)}</div>
          <div className="text-xs text-slate-400 font-medium mt-2">
            {formatDateTime(gap.from.dateTime)} → {formatDateTime(gap.to.dateTime)}
          </div>
        </div>
      )}
    </ChartCard>
  );
};

export default LongestGapCard;

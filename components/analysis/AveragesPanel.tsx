
import React, { useMemo } from 'react';
import { SmokingRecord, filterDays } from '../../types';
import { computeAverageWithoutToday, computeAverageByTypeOfDay } from '../../util/analytics';

interface AveragesPanelProps {
  filteredRecords: SmokingRecord[];
  periodOnlyRecords: SmokingRecord[];
}

const AveragesPanel: React.FC<AveragesPanelProps> = ({ filteredRecords, periodOnlyRecords }) => {
  const averageWithoutToday = useMemo(() => computeAverageWithoutToday(filteredRecords), [filteredRecords]);
  const averageByTypeOfDay = useMemo(() => computeAverageByTypeOfDay(periodOnlyRecords), [periodOnlyRecords]);

  return (
    <div>
      <p className="text-lg font-bold pl-8">Médias</p>
      <table className="border-separate border-spacing-x-8 mt-4">
        <thead>
          <tr>
            <th className="text-left text-sm text-slate-700 pb-2 pr-8 border-r border-slate-500">Média Diária</th>
            <th className="text-left text-sm text-slate-700 pb-2 pr-8 border-r border-slate-500">Dia de Semana</th>
            <th className="text-left text-sm text-slate-700 pb-2">Final de Semana</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-3xl font-bold text-slate-800 border-r border-slate-500">{averageWithoutToday}</td>
            <td className="text-3xl font-bold text-slate-800 border-r border-slate-500">{averageByTypeOfDay[filterDays.WEEK_DAYS]}</td>
            <td className="text-3xl font-bold text-slate-800">{averageByTypeOfDay[filterDays.WEEKENDS]}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AveragesPanel;

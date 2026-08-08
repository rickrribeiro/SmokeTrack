
import { useMemo } from 'react';
import { SmokingRecord, FilterRange, filterDays } from '../../types';
import { getFilteredRecords, getRecordsInPeriod } from '../../util/analytics';

export interface FilteredRecordsResult {
  /** Respeita período + filtro de dias de semana/fim de semana. Usado pela maioria das seções. */
  filteredRecords: SmokingRecord[];
  /** Respeita só o período (sem o filtro de dias). Usado pelas médias de dia de semana/fim de semana. */
  periodOnlyRecords: SmokingRecord[];
}

/**
 * Resolve os 3 filtros de análise (período/dias) uma única vez, para não duplicar
 * a lógica de filtragem em cada seção nova da tela de Análise. `strategyFilter`
 * não filtra registros (só muda a divisão exibida em algumas seções), por isso
 * não participa deste hook e é passado como prop simples onde for necessário.
 */
export function useFilteredRecords(records: SmokingRecord[], periodo: FilterRange, daysFilter: filterDays): FilteredRecordsResult {
  const filteredRecords = useMemo(
    () => getFilteredRecords(records, periodo, daysFilter),
    [records, periodo, daysFilter]
  );
  const periodOnlyRecords = useMemo(
    () => getRecordsInPeriod(records, periodo),
    [records, periodo]
  );

  return { filteredRecords, periodOnlyRecords };
}


import { useMemo } from 'react';
import { SmokingRecord, AnalysisSelection, filterDays } from '../../types';
import { getSelectionRecords, getSelectionOnlyRecords } from '../../util/analytics';

export interface FilteredRecordsResult {
  /** Respeita o recorte (período ou mês) + filtro de dias de semana/fim de semana. Usado pela maioria das seções. */
  filteredRecords: SmokingRecord[];
  /** Respeita só o recorte (sem o filtro de dias). Usado pelas médias de dia de semana/fim de semana. */
  periodOnlyRecords: SmokingRecord[];
}

/**
 * Resolve os filtros de análise (recorte temporal + filtro de dias) uma única vez,
 * para não duplicar a lógica de filtragem em cada seção nova da tela de Análise.
 * `strategyFilter` não filtra registros (só muda a divisão exibida em algumas seções),
 * por isso não participa deste hook e é passado como prop simples onde for necessário.
 */
export function useFilteredRecords(records: SmokingRecord[], selection: AnalysisSelection, daysFilter: filterDays): FilteredRecordsResult {
  const filteredRecords = useMemo(
    () => getSelectionRecords(records, selection, daysFilter),
    [records, selection, daysFilter]
  );
  const periodOnlyRecords = useMemo(
    () => getSelectionOnlyRecords(records, selection),
    [records, selection]
  );

  return { filteredRecords, periodOnlyRecords };
}

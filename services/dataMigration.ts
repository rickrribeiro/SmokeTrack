
import { AppData } from '../types';
import { INITIAL_SMOKE_TYPES, INITIAL_ACTIVITIES, INITIAL_NOTES } from '../constants';
import { validateRecords } from './validators';

/**
 * Ponto único de normalização de dados vindos de fora (localStorage ou import).
 * Garante que todos os campos de AppData existam como arrays, preenchendo com
 * os valores iniciais apenas quando o campo estiver ausente (nunca sobrescreve
 * dados que já existem, mesmo que vazios). Delega a validação/normalização de
 * cada record (incluindo os campos opcionais mood/note) para validateRecords.
 *
 * É chamada nos dois únicos lugares onde JSON externo vira AppData:
 * storageService.loadData() (boot) e storageService.validateImportedData() (import).
 */
export function normalizeAppData(raw: unknown): AppData {
  const source = (raw && typeof raw === 'object') ? raw as Partial<AppData> : {};

  const data: AppData = {
    records: Array.isArray(source.records) ? source.records : [],
    smokingTypes: Array.isArray(source.smokingTypes) ? source.smokingTypes : INITIAL_SMOKE_TYPES,
    activities: Array.isArray(source.activities) ? source.activities : INITIAL_ACTIVITIES,
    notes: Array.isArray(source.notes) ? source.notes : INITIAL_NOTES,
  };

  if (data.records.length > 0) {
    // normaliza/valida in-place; lança erro (string) se algum record estiver malformado
    validateRecords(data);
  }

  return data;
}


import { AppData } from '../types';
import { STORAGE_KEY, INITIAL_SMOKE_TYPES, INITIAL_ACTIVITIES } from '../constants';
import { validateRecords } from './validators';

const INITIAL_DATA: AppData = {
  records: [],
  smokingTypes: INITIAL_SMOKE_TYPES,
  activities: INITIAL_ACTIVITIES,
};

export const storageService = {
  saveData: (data: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  loadData: (): AppData => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return INITIAL_DATA;
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao carregar dados', e);
      return INITIAL_DATA;
    }
  },

  exportJSON: (data: AppData): string => {
    return JSON.stringify(data, null, 2);
  },
  validateImportedData: (jsonString: string): AppData | null => {
    try {
      const data = JSON.parse(jsonString);
      if (
        data &&
        (data.records && Array.isArray(data.records) && validateRecords(data)) ||
        (data.smokingTypes && Array.isArray(data.smokingTypes)) ||
        (data.activities && Array.isArray(data.activities))
      ) {
        return data as AppData;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
};

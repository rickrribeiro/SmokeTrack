
import { FilterRange, filterDays, filterStrategies } from './types';

export const INITIAL_SMOKE_TYPES = [
  'Cigarro',
  'Meio charuto',
  'Charuto inteiro',
  'Cigarrilha / Purito',
  'Tabaco',
  'Pod',
  'Chiclete de nicotina'
];

export const INITIAL_ACTIVITIES = [
  'Estudando',
  'Aula',
  'Reunião Velt',
  'Reunião Trabalho',
  'Trabalhando',
  'Jogando LoL',
  'Bar',
  'Festa',
  'Social com amigos',
  'Nada em especial',
];

export const PERIODS = Object.values(FilterRange);

export const FILTER_STRATEGIES = Object.values(filterStrategies);

export const FILTER_DAYS = Object.values(filterDays);

export const STORAGE_KEY = 'smoke_track_data';

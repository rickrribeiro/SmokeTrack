
import { FilterRange } from './types';

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
  'Social com amigos'
];

export const PERIODS = Object.values(FilterRange);

export const STORAGE_KEY = 'smoke_track_data';

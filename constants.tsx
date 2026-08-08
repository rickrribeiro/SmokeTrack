
import { FilterRange, filterDays, filterStrategies, Mood } from './types';

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

export const INITIAL_NOTES = [
  'Após refeição',
  'Café',
  'Álcool',
  'Trabalho intenso',
  'Pausa do trabalho',
  'Estudando',
  'Jogando',
  'Socializando',
  'Ansiedade',
  'Tédio',
  'Insônia',
  'Dirigindo',
  'Esperando algo',
  'Com amigos',
  'Outro',
];

export const PERIODS = Object.values(FilterRange);

export const FILTER_STRATEGIES = Object.values(filterStrategies);

export const FILTER_DAYS = Object.values(filterDays);

export const STORAGE_KEY = 'smoke_track_data';

export interface MoodOption {
  value: Mood;
  label: string;
  emoji: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { value: 'calmo', label: 'Calmo', emoji: '😌' },
  { value: 'neutro', label: 'Neutro', emoji: '😐' },
  { value: 'estressado', label: 'Estressado', emoji: '😣' },
];

export interface HourBucket {
  key: string;
  label: string;
  startHour: number; // inclusive
  endHour: number; // exclusive
}

export const HOUR_BUCKETS: HourBucket[] = [
  { key: 'madrugada', label: 'Madrugada', startHour: 0, endHour: 5 },
  { key: 'manha', label: 'Manhã', startHour: 5, endHour: 12 },
  { key: 'tarde', label: 'Tarde', startHour: 12, endHour: 18 },
  { key: 'noite', label: 'Noite', startHour: 18, endHour: 24 },
];

export interface IntervalBucketDef {
  label: string;
  maxMs: number | null; // null = sem limite superior (24h+)
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export const INTERVAL_BUCKETS: IntervalBucketDef[] = [
  { label: '0–30min', maxMs: 30 * MINUTE },
  { label: '30–60min', maxMs: 60 * MINUTE },
  { label: '1–2h', maxMs: 2 * HOUR },
  { label: '2–4h', maxMs: 4 * HOUR },
  { label: '4–8h', maxMs: 8 * HOUR },
  { label: '8–12h', maxMs: 12 * HOUR },
  { label: '12–24h', maxMs: 24 * HOUR },
  { label: '24h+', maxMs: null },
];

// Paleta compartilhada (extraída do que já era usado inline em AnalysisScreen)
export const CHART_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

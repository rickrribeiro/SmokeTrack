export type Mood = 'calmo' | 'neutro' | 'estressado';

export interface SmokingRecord {
  id: string;
  smokeType: string;
  dateTime: string;
  activity: string;
  mood?: Mood;
  note?: string;
}

export interface AppData {
  records: SmokingRecord[];
  smokingTypes: string[];
  activities: string[];
  notes: string[];
}

export enum FilterRange {
  DAYS_3 = '3 dias',
  DAYS_7 = '7 dias',
  DAYS_14 = '14 dias',
  DAYS_30 = '30 dias',
  DAYS_60 = '60 dias',
  DAYS_90 = '90 dias',
  TOTAL = 'Total'
}

/** Como o recorte temporal da tela de Análise é escolhido: período relativo (últimos N dias) ou mês-calendário. */
export enum AnalysisMode {
  PERIOD = 'periodo',
  MONTH = 'mes',
}

/** `month` é uma chave `yyyy-MM` (ver util/months.ts). */
export type AnalysisSelection =
  | { mode: AnalysisMode.PERIOD; periodo: FilterRange }
  | { mode: AnalysisMode.MONTH; month: string };

export interface DateRange {
  start: Date;
  end: Date;
}

export enum filterStrategies {
  TOTAL = 'Total',
  AVERAGE = 'Média',
}

export enum filterDays {
  TOTAL = 'Total',
  WEEK_DAYS = 'Dias de semana',
  WEEKENDS = 'Finais de semana',
}
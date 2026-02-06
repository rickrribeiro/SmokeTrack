export interface SmokingRecord {
  id: string;
  smokeType: string;
  dateTime: string;
  activity: string;
}

export interface AppData {
  records: SmokingRecord[];
  smokingTypes: string[];
  activities: string[];
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

export enum filterStrategies {
  TOTAL = 'Total',
  AVERAGE = 'Média',
}

export enum filterDays {
  TOTAL = 'Total',
  WEEK_DAYS = 'Dias de semana',
  WEEKENDS = 'Finais de semana',
}
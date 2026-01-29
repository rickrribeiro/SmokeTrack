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
  DAYS_3 = '3 days',
  DAYS_7 = '7 days',
  DAYS_14 = '14 days',
  DAYS_30 = '30 days',
  DAYS_60 = '60 days',
  DAYS_90 = '90 days',
  TOTAL = 'Total'
}

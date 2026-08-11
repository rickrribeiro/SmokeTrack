import { describe, it, expect } from 'vitest';
import { getDay } from 'date-fns';
import { SmokingRecord, AnalysisMode, AnalysisSelection, FilterRange, filterDays } from '../types';
import {
  getPeriodRange,
  getSelectionRange,
  getPreviousSelectionRange,
  filterRecordsInRange,
  getSelectionRecords,
  countCalendarDays,
  computeMonthSummary,
  computeComparison,
} from './analytics';

const NOW = new Date(2026, 7, 11, 12, 0, 0); // 11/08/2026, mês de agosto em andamento
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const record = (dateTime: string, activity = 'Trabalhando', smokeType = 'Cigarro'): SmokingRecord => ({
  id: dateTime,
  smokeType,
  dateTime,
  activity,
});

/** Julho/2026 (mês fechado em relação a NOW): 6 registros em 3 dias distintos. */
const JULY_RECORDS: SmokingRecord[] = [
  record('2026-07-01T08:00'),
  record('2026-07-01T20:00'),
  record('2026-07-02T09:00'),
  record('2026-07-15T09:00', 'Bar', 'Charuto inteiro'),
  record('2026-07-15T10:00', 'Bar'),
  record('2026-07-15T11:00'),
];

const AROUND_JULY: SmokingRecord[] = [
  record('2026-06-10T10:00'),
  record('2026-06-30T23:59'),
  ...JULY_RECORDS,
  record('2026-08-01T00:30'),
];

const monthSelection = (month: string): AnalysisSelection => ({ mode: AnalysisMode.MONTH, month });
const periodSelection = (periodo: FilterRange): AnalysisSelection => ({ mode: AnalysisMode.PERIOD, periodo });

describe('recortes de análise', () => {
  it('mantém o comportamento do período relativo (N dias atrás até o fim de hoje)', () => {
    const range = getPeriodRange(FilterRange.DAYS_7, NOW)!;
    expect(range.start.getTime()).toBe(new Date(2026, 7, 4, 0, 0, 0, 0).getTime());
    expect(range.end.getTime()).toBe(new Date(2026, 7, 11, 23, 59, 59, 999).getTime());
  });

  it('período Total não tem intervalo nem anterior', () => {
    expect(getPeriodRange(FilterRange.TOTAL, NOW)).toBeNull();
    expect(getSelectionRange(periodSelection(FilterRange.TOTAL), NOW)).toBeNull();
    expect(getPreviousSelectionRange(periodSelection(FilterRange.TOTAL), NOW)).toBeNull();
  });

  it('modo mês resolve o mês-calendário inteiro, independente de hoje', () => {
    const range = getSelectionRange(monthSelection('2026-07'), NOW)!;
    expect(range.start.getTime()).toBe(new Date(2026, 6, 1, 0, 0, 0, 0).getTime());
    expect(range.end.getTime()).toBe(new Date(2026, 6, 31, 23, 59, 59, 999).getTime());
  });

  it('o anterior do modo mês é o mês-calendário anterior', () => {
    const previous = getPreviousSelectionRange(monthSelection('2026-01'), NOW)!;
    expect(previous.start.getTime()).toBe(new Date(2025, 11, 1, 0, 0, 0, 0).getTime());
    expect(previous.end.getTime()).toBe(new Date(2025, 11, 31, 23, 59, 59, 999).getTime());
  });

  it('filtra exatamente os registros do mês (extremos inclusive) e ordena cronologicamente', () => {
    const filtered = getSelectionRecords(AROUND_JULY, monthSelection('2026-07'), filterDays.TOTAL, NOW);
    expect(filtered.map(r => r.dateTime)).toEqual([
      '2026-07-01T08:00',
      '2026-07-01T20:00',
      '2026-07-02T09:00',
      '2026-07-15T09:00',
      '2026-07-15T10:00',
      '2026-07-15T11:00',
    ]);
  });

  it('intervalo nulo (Total) devolve todos os registros ordenados', () => {
    const filtered = filterRecordsInRange(AROUND_JULY, null, filterDays.TOTAL);
    expect(filtered).toHaveLength(AROUND_JULY.length);
    expect(filtered[0].dateTime).toBe('2026-06-10T10:00');
    expect(filtered[filtered.length - 1].dateTime).toBe('2026-08-01T00:30');
  });

  it('aplica o filtro de dias dentro do mês', () => {
    const weekends = getSelectionRecords(AROUND_JULY, monthSelection('2026-07'), filterDays.WEEKENDS, NOW);
    weekends.forEach(r => {
      const day = getDay(new Date(r.dateTime));
      expect(day === 0 || day === 6).toBe(true);
    });
    const weekdays = getSelectionRecords(AROUND_JULY, monthSelection('2026-07'), filterDays.WEEK_DAYS, NOW);
    expect(weekends.length + weekdays.length).toBe(JULY_RECORDS.length);
  });
});

describe('countCalendarDays', () => {
  const july = { start: new Date(2026, 6, 1), end: new Date(2026, 6, 31, 23, 59) };

  it('conta todos os dias do mês', () => {
    expect(countCalendarDays(july, filterDays.TOTAL)).toBe(31);
  });

  it('separa dias úteis e fins de semana somando o mês inteiro', () => {
    const weekends = countCalendarDays(july, filterDays.WEEKENDS);
    const weekdays = countCalendarDays(july, filterDays.WEEK_DAYS);
    expect(weekends).toBe(8); // 4 sábados + 4 domingos em julho/2026
    expect(weekdays).toBe(23);
    expect(weekends + weekdays).toBe(31);
  });
});

describe('computeMonthSummary', () => {
  it('resume um mês fechado', () => {
    const summary = computeMonthSummary(AROUND_JULY, '2026-07', filterDays.TOTAL, NOW);

    expect(summary.inProgress).toBe(false);
    expect(summary.totalRecords).toBe(6);
    expect(summary.calendarDays).toBe(31);
    expect(summary.daysWithRecords).toBe(3);
    expect(summary.daysWithoutRecords).toBe(28);
    expect(summary.avgPerCalendarDay).toBeCloseTo(6 / 31, 6);
    expect(summary.avgPerActiveDay).toBeCloseTo(2, 6);
    expect(summary.busiestDay).toEqual({ date: '2026-07-15', count: 3 });
    expect(summary.topActivity).toEqual({ name: 'Trabalhando', count: 4 });
    expect(summary.topType).toEqual({ name: 'Cigarro', count: 5 });
  });

  it('calcula intervalo médio e maior intervalo só dentro do mês', () => {
    const summary = computeMonthSummary(AROUND_JULY, '2026-07', filterDays.TOTAL, NOW);
    // Intervalos: 12h, 13h, 13d, 1h, 1h
    const expectedTotal = 12 * HOUR_MS + 13 * HOUR_MS + 13 * DAY_MS + HOUR_MS + HOUR_MS;
    expect(summary.avgIntervalMs).toBeCloseTo(expectedTotal / 5, 6);
    expect(summary.longestGapMs).toBe(13 * DAY_MS);
  });

  it('considera só os dias já decorridos em um mês em andamento', () => {
    const records = [record('2026-08-01T10:00'), record('2026-08-10T10:00'), record('2026-08-10T12:00')];
    const summary = computeMonthSummary(records, '2026-08', filterDays.TOTAL, NOW);

    expect(summary.inProgress).toBe(true);
    expect(summary.calendarDays).toBe(11); // 01 a 11/08
    expect(summary.totalRecords).toBe(3);
    expect(summary.avgPerCalendarDay).toBeCloseTo(3 / 11, 6);
    expect(summary.daysWithoutRecords).toBe(9);
  });

  it('devolve um resumo vazio quando o mês não tem registros', () => {
    const summary = computeMonthSummary(AROUND_JULY, '2026-05', filterDays.TOTAL, NOW);
    expect(summary.totalRecords).toBe(0);
    expect(summary.daysWithRecords).toBe(0);
    expect(summary.avgPerCalendarDay).toBe(0);
    expect(summary.avgPerActiveDay).toBe(0);
    expect(summary.busiestDay).toBeNull();
    expect(summary.longestGapMs).toBeNull();
    expect(summary.topActivity).toBeNull();
    expect(summary.avgIntervalMs).toBe(0);
  });

  it('mês inteiramente no futuro não tem dias decorridos', () => {
    const summary = computeMonthSummary([], '2026-12', filterDays.TOTAL, NOW);
    expect(summary.calendarDays).toBe(0);
    expect(summary.inProgress).toBe(false);
    expect(summary.avgPerCalendarDay).toBe(0);
  });

  it('o filtro de dias vale para totais e dias, mas não para as médias por tipo de dia', () => {
    const summary = computeMonthSummary(AROUND_JULY, '2026-07', filterDays.WEEKENDS, NOW);
    const weekendRecords = JULY_RECORDS.filter(r => {
      const day = getDay(new Date(r.dateTime));
      return day === 0 || day === 6;
    });

    expect(summary.totalRecords).toBe(weekendRecords.length);
    expect(summary.calendarDays).toBe(8);
    // Médias por tipo de dia usam o mês inteiro, então dias úteis não zeram.
    expect(summary.weekdayAverage).toBeGreaterThan(0);
  });
});

describe('computeComparison', () => {
  it('compara o mês selecionado com o mês anterior', () => {
    const comparison = computeComparison(AROUND_JULY, monthSelection('2026-07'), filterDays.TOTAL, NOW)!;

    expect(comparison.currentRange.start.getTime()).toBe(new Date(2026, 6, 1, 0, 0, 0, 0).getTime());
    expect(comparison.previousRange.start.getTime()).toBe(new Date(2026, 5, 1, 0, 0, 0, 0).getTime());
    expect(comparison.totalRecords.current).toBe(6);
    expect(comparison.totalRecords.previous).toBe(2);
    expect(comparison.totalRecords.trend).toBe('up');
  });

  it('mês sem anterior mostra variação indefinida em vez de erro', () => {
    const comparison = computeComparison(JULY_RECORDS, monthSelection('2026-07'), filterDays.TOTAL, NOW)!;
    expect(comparison.totalRecords.previous).toBe(0);
    expect(comparison.totalRecords.diffPct).toBeNull();
  });

  it('segue indisponível para o período Total', () => {
    expect(computeComparison(AROUND_JULY, periodSelection(FilterRange.TOTAL), filterDays.TOTAL, NOW)).toBeNull();
  });

  it('continua comparando períodos relativos de mesma duração', () => {
    const comparison = computeComparison(AROUND_JULY, periodSelection(FilterRange.DAYS_7), filterDays.TOTAL, NOW)!;
    expect(comparison.currentRange.start.getTime()).toBe(new Date(2026, 7, 4, 0, 0, 0, 0).getTime());
    expect(comparison.previousRange.start.getTime()).toBe(new Date(2026, 6, 28, 0, 0, 0, 0).getTime());
    expect(comparison.previousRange.end.getTime()).toBe(new Date(2026, 7, 3, 23, 59, 59, 999).getTime());
  });
});

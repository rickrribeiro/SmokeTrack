
import { format, subDays, isWithinInterval, startOfDay, endOfDay, getDay, getHours } from 'date-fns';
import { SmokingRecord, FilterRange, filterDays, filterStrategies, Mood } from '../types';
import { getDaysDifference } from './dateUtils';
import { MOOD_OPTIONS, HOUR_BUCKETS, INTERVAL_BUCKETS, HourBucket } from '../constants';

export interface DayOfWeekCount {
  total: number;
  diffDays: number;
}

export interface DailyTrendPoint {
  date: string;
  count: number;
  movingAvg: number;
}

export interface DayOfWeekPoint {
  day: string;
  count: number | string;
}

export interface HourlyPoint {
  hour: string;
  count: string;
}

export interface NameCount {
  name: string;
  count: number;
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

/** Filtra registros por período + tipo de dia (dias de semana/fim de semana), ordenado cronologicamente. */
export function getFilteredRecords(records: SmokingRecord[], periodo: FilterRange, daysFilter: filterDays): SmokingRecord[] {
  let filtered = records;
  if (periodo !== FilterRange.TOTAL) {
    const days = parseInt(periodo.split(' ')[0]);
    const startDate = subDays(new Date(), days);

    filtered = records.filter(record =>
      isWithinInterval(new Date(record.dateTime), {
        start: startOfDay(startDate),
        end: endOfDay(new Date())
      })
    );
  }
  if (daysFilter === filterDays.WEEK_DAYS) {
    filtered = filtered.filter(r => {
      const day = getDay(new Date(r.dateTime));
      return day !== 0 && day !== 6;
    });
  } else if (daysFilter === filterDays.WEEKENDS) {
    filtered = filtered.filter(r => {
      const day = getDay(new Date(r.dateTime));
      return day === 0 || day === 6;
    });
  }

  return filtered.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
}

/** Filtra registros só por período (sem aplicar o filtro de dias de semana/fim de semana). */
export function getRecordsInPeriod(records: SmokingRecord[], periodo: FilterRange): SmokingRecord[] {
  if (periodo === FilterRange.TOTAL) {
    return [...records].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }
  const days = parseInt(periodo.split(' ')[0]);
  const startDate = subDays(new Date(), days);
  return records
    .filter(r => isWithinInterval(new Date(r.dateTime), {
      start: startOfDay(startDate),
      end: endOfDay(new Date())
    }))
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
}

/**
 * Conta registros por dia da semana. NOTA: `diffDays` conta "transições" de dia
 * da semana na sequência ordenada cronologicamente (não dias-calendário distintos
 * reais) — comportamento pré-existente preservado de propósito para não alterar
 * os números já exibidos em AveragesPanel/DayOfWeekCard. Ver PeriodComparison
 * para uma contagem de dias distintos correta usada nas features novas.
 */
export function getTotalByDayOfWeek(records: SmokingRecord[]): DayOfWeekCount[] {
  const counts: DayOfWeekCount[] = Array.from({ length: 7 }, () => ({ total: 0, diffDays: 0 }));
  let lastDay: number | null = null;

  records.forEach(r => {
    const day = getDay(new Date(r.dateTime));
    if (day !== lastDay) {
      lastDay = day;
      counts[lastDay].diffDays += 1;
    }
    counts[lastDay].total += 1;
  });
  return counts;
}

export function buildDailyTrend(filteredRecords: SmokingRecord[]): DailyTrendPoint[] {
  const map: Record<string, number> = {};
  filteredRecords.forEach(r => {
    const d = format(new Date(r.dateTime), 'dd/MM');
    map[d] = (map[d] || 0) + 1;
  });
  const points = Object.keys(map).map(date => ({ date, count: map[date] }));
  return points.map((p, i) => {
    const window = points.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((s, x) => s + x.count, 0) / window.length;
    return { ...p, movingAvg: parseFloat(avg.toFixed(2)) };
  });
}

export function buildDayOfWeekData(filteredRecords: SmokingRecord[], strategyFilter: filterStrategies): DayOfWeekPoint[] {
  const counts = getTotalByDayOfWeek(filteredRecords);
  return DAY_LABELS.map((day, i) => {
    const count = strategyFilter === filterStrategies.AVERAGE && counts[i].diffDays > 0
      ? (counts[i].total / counts[i].diffDays).toFixed(1)
      : counts[i].total;
    return { day, count };
  });
}

export function buildHourlyData(filteredRecords: SmokingRecord[], strategyFilter: filterStrategies): HourlyPoint[] {
  const counts = Array(24).fill(0);
  filteredRecords.forEach(r => {
    counts[getHours(new Date(r.dateTime))] += 1;
  });
  return counts.map((count, hour) => {
    const rawDays = strategyFilter === filterStrategies.AVERAGE
      ? getDaysDifference(
        new Date(filteredRecords[filteredRecords.length - 1]?.dateTime),
        new Date(filteredRecords[0]?.dateTime)
      )
      : 1;
    const days = rawDays || 1; // evita divisão por zero quando todos os registros filtrados são do mesmo dia
    return { hour: `${hour}h`, count: (count / days).toFixed(1) };
  });
}

function countByField(records: SmokingRecord[], field: 'activity' | 'smokeType'): NameCount[] {
  const map: Record<string, number> = {};
  records.forEach(r => {
    map[r[field]] = (map[r[field]] || 0) + 1;
  });
  return Object.keys(map).map(name => ({ name, count: map[name] })).sort((a, b) => b.count - a.count);
}

export function buildActivityData(filteredRecords: SmokingRecord[]): NameCount[] {
  return countByField(filteredRecords, 'activity');
}

export function buildTypeData(filteredRecords: SmokingRecord[]): NameCount[] {
  return countByField(filteredRecords, 'smokeType');
}

export function computeAverageWithoutToday(filteredRecords: SmokingRecord[]): string {
  const today = new Date().toDateString();
  const withoutToday = filteredRecords.filter(r => new Date(r.dateTime).toDateString() !== today);
  const distinctDays = new Set(withoutToday.map(r => new Date(r.dateTime).toDateString())).size;
  if (distinctDays === 0) return "0.00";
  return (withoutToday.length / distinctDays).toFixed(2);
}

export function computeAverageByTypeOfDay(recordsInPeriod: SmokingRecord[]): Record<string, string> {
  const counts = getTotalByDayOfWeek(recordsInPeriod);
  const weekends = (counts[0].total + counts[6].total) / (counts[0].diffDays + counts[6].diffDays || 1);
  const weekDays = counts.slice(1, 6).reduce((sum, c) => sum + c.total, 0) / (counts.slice(1, 6).reduce((sum, c) => sum + c.diffDays, 0) || 1);
  return {
    [filterDays.WEEKENDS]: weekends.toFixed(2),
    [filterDays.WEEK_DAYS]: weekDays.toFixed(2)
  };
}

// ---------------------------------------------------------------------------
// Intervalos entre registros / maior intervalo sem fumar
// ---------------------------------------------------------------------------

/** Calcula os intervalos (ms) entre registros consecutivos já ordenados cronologicamente. */
export function computeIntervalsMs(sortedRecords: SmokingRecord[]): number[] {
  const intervals: number[] = [];
  for (let i = 1; i < sortedRecords.length; i++) {
    const prev = new Date(sortedRecords[i - 1].dateTime).getTime();
    const curr = new Date(sortedRecords[i].dateTime).getTime();
    intervals.push(curr - prev);
  }
  return intervals;
}

export interface IntervalStats {
  count: number;
  avgMs: number;
  medianMs: number;
  minMs: number;
  maxMs: number;
  p90Ms: number;
}

/** Mediana e P90 usam aproximações simples (nearest-rank), adequadas para um app pessoal. */
export function computeIntervalStats(intervalsMs: number[]): IntervalStats | null {
  if (intervalsMs.length === 0) return null;
  const sorted = [...intervalsMs].sort((a, b) => a - b);
  const n = sorted.length;
  const avgMs = sorted.reduce((s, v) => s + v, 0) / n;
  const medianMs = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[(n - 1) / 2];
  const p90Index = Math.min(n - 1, Math.max(0, Math.ceil(0.9 * n) - 1));

  return {
    count: n,
    avgMs,
    medianMs,
    minMs: sorted[0],
    maxMs: sorted[n - 1],
    p90Ms: sorted[p90Index],
  };
}

export interface IntervalBucketResult {
  label: string;
  count: number;
}

export function bucketIntervals(intervalsMs: number[]): IntervalBucketResult[] {
  const buckets = INTERVAL_BUCKETS.map(b => ({ label: b.label, count: 0 }));
  intervalsMs.forEach(ms => {
    const idx = INTERVAL_BUCKETS.findIndex(b => b.maxMs === null || ms <= b.maxMs);
    buckets[idx === -1 ? buckets.length - 1 : idx].count += 1;
  });
  return buckets;
}

export interface LongestGap {
  ms: number;
  from: SmokingRecord;
  to: SmokingRecord;
}

/**
 * Maior intervalo entre dois registros consecutivos dentro do array informado.
 * Nunca compara contra o momento atual (não considera intervalo "aberto").
 */
export function findLongestGap(sortedRecords: SmokingRecord[]): LongestGap | null {
  if (sortedRecords.length < 2) return null;
  let longest: LongestGap | null = null;
  for (let i = 1; i < sortedRecords.length; i++) {
    const from = sortedRecords[i - 1];
    const to = sortedRecords[i];
    const ms = new Date(to.dateTime).getTime() - new Date(from.dateTime).getTime();
    if (!longest || ms > longest.ms) {
      longest = { ms, from, to };
    }
  }
  return longest;
}

// ---------------------------------------------------------------------------
// Calendário de consumo (365 dias) / linha do tempo diária
// ---------------------------------------------------------------------------

export interface CalendarDay {
  date: string; // yyyy-MM-dd
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

/** Independe dos filtros de análise: sempre considera a janela fixa de `days` dias terminando hoje. */
export function buildCalendarHeatmapData(records: SmokingRecord[], days: number = 365, now: Date = new Date()): CalendarDay[] {
  const counts = new Map<string, number>();
  records.forEach(r => {
    const key = format(new Date(r.dateTime), 'yyyy-MM-dd');
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const max = Math.max(1, ...Array.from(counts.values()));
  const todayStart = startOfDay(now);

  const result: CalendarDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(todayStart, i);
    const key = format(date, 'yyyy-MM-dd');
    const count = counts.get(key) || 0;
    const level = count === 0 ? 0 : (Math.min(4, Math.ceil((count / max) * 4)) as 0 | 1 | 2 | 3 | 4);
    result.push({ date: key, count, level });
  }
  return result;
}

export interface TimelineRecord extends SmokingRecord {
  hourFraction: number; // 0-24
}

/** Independe dos filtros de análise: mostra os registros de um dia específico. */
export function buildDayTimelineData(records: SmokingRecord[], date: Date): TimelineRecord[] {
  const dayKey = date.toDateString();
  return records
    .filter(r => new Date(r.dateTime).toDateString() === dayKey)
    .map(r => {
      const d = new Date(r.dateTime);
      return { ...r, hourFraction: d.getHours() + d.getMinutes() / 60 };
    })
    .sort((a, b) => a.hourFraction - b.hourFraction);
}

// ---------------------------------------------------------------------------
// Comparação de períodos
// ---------------------------------------------------------------------------

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Retorna o intervalo do "período anterior de mesma duração" (mesmo nº de
 * dias-calendário, sem sobreposição/lacuna). `null` quando periodo = Total,
 * já que não há uma duração fixa para replicar.
 */
export function getPreviousPeriodRange(periodo: FilterRange, now: Date = new Date()): DateRange | null {
  if (periodo === FilterRange.TOTAL) return null;
  const days = parseInt(periodo.split(' ')[0]);
  const currentStart = startOfDay(subDays(now, days));
  const previousEnd = endOfDay(subDays(currentStart, 1));
  const previousStart = startOfDay(subDays(currentStart, days));
  return { start: previousStart, end: previousEnd };
}

function filterRecordsInRange(records: SmokingRecord[], range: DateRange, daysFilter: filterDays): SmokingRecord[] {
  let filtered = records.filter(r => {
    const t = new Date(r.dateTime).getTime();
    return t >= range.start.getTime() && t <= range.end.getTime();
  });
  if (daysFilter === filterDays.WEEK_DAYS) {
    filtered = filtered.filter(r => { const day = getDay(new Date(r.dateTime)); return day !== 0 && day !== 6; });
  } else if (daysFilter === filterDays.WEEKENDS) {
    filtered = filtered.filter(r => { const day = getDay(new Date(r.dateTime)); return day === 0 || day === 6; });
  }
  return filtered.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
}

/**
 * Contagem de dia da semana por dias-calendário DISTINTOS (via Set), diferente
 * de getTotalByDayOfWeek (que conta "transições" — bug legado preservado só
 * para as seções já existentes). Usada pelas features novas.
 */
function getAccurateDayOfWeekCounts(records: SmokingRecord[]): { total: number; distinctDays: number }[] {
  const counts = Array.from({ length: 7 }, () => ({ total: 0, distinctDays: 0 }));
  const daySeen: Set<string>[] = Array.from({ length: 7 }, () => new Set());
  records.forEach(r => {
    const d = new Date(r.dateTime);
    const dow = getDay(d);
    counts[dow].total += 1;
    daySeen[dow].add(d.toDateString());
  });
  counts.forEach((c, i) => { c.distinctDays = daySeen[i].size; });
  return counts;
}

interface PeriodSnapshot {
  totalRecords: number;
  dailyAverage: number;
  weekdayAverage: number;
  weekendAverage: number;
  avgIntervalMs: number;
}

function computeSnapshot(records: SmokingRecord[], range: DateRange, daysFilter: filterDays): PeriodSnapshot {
  const filtered = filterRecordsInRange(records, range, daysFilter);
  const periodOnly = filterRecordsInRange(records, range, filterDays.TOTAL);

  const distinctDays = new Set(filtered.map(r => new Date(r.dateTime).toDateString())).size;
  const dailyAverage = distinctDays > 0 ? filtered.length / distinctDays : 0;

  const dowCounts = getAccurateDayOfWeekCounts(periodOnly);
  const weekendTotal = dowCounts[0].total + dowCounts[6].total;
  const weekendDays = dowCounts[0].distinctDays + dowCounts[6].distinctDays;
  const weekendAverage = weekendDays > 0 ? weekendTotal / weekendDays : 0;
  const weekdayTotal = dowCounts.slice(1, 6).reduce((s, c) => s + c.total, 0);
  const weekdayDays = dowCounts.slice(1, 6).reduce((s, c) => s + c.distinctDays, 0);
  const weekdayAverage = weekdayDays > 0 ? weekdayTotal / weekdayDays : 0;

  const intervals = computeIntervalsMs(filtered);
  const avgIntervalMs = intervals.length > 0 ? intervals.reduce((s, v) => s + v, 0) / intervals.length : 0;

  return { totalRecords: filtered.length, dailyAverage, weekdayAverage, weekendAverage, avgIntervalMs };
}

export interface ComparisonMetric {
  current: number;
  previous: number;
  diff: number;
  diffPct: number | null; // null quando previous=0 e current=0 (sem variação relativa definida)
  trend: 'up' | 'down' | 'stable'; // stable = variação dentro de ±5%
}

const STABLE_THRESHOLD = 0.05;

function buildMetric(current: number, previous: number): ComparisonMetric {
  const diff = current - previous;
  const diffPct = previous !== 0 ? diff / previous : (current === 0 ? 0 : null);
  let trend: ComparisonMetric['trend'] = 'stable';
  if (diffPct !== null && Math.abs(diffPct) > STABLE_THRESHOLD) {
    trend = diffPct > 0 ? 'up' : 'down';
  }
  return { current, previous, diff, diffPct, trend };
}

export interface ComparisonResult {
  currentRange: DateRange;
  previousRange: DateRange;
  totalRecords: ComparisonMetric;
  dailyAverage: ComparisonMetric;
  weekdayAverage: ComparisonMetric;
  weekendAverage: ComparisonMetric;
  avgIntervalMs: ComparisonMetric;
}

/** `null` quando periodo = Total (sem duração fixa para definir um "período anterior"). */
export function computeComparison(records: SmokingRecord[], periodo: FilterRange, daysFilter: filterDays, now: Date = new Date()): ComparisonResult | null {
  if (periodo === FilterRange.TOTAL) return null;
  const days = parseInt(periodo.split(' ')[0]);
  const currentRange: DateRange = { start: startOfDay(subDays(now, days)), end: endOfDay(now) };
  const previousRange = getPreviousPeriodRange(periodo, now);
  if (!previousRange) return null;

  const currentSnapshot = computeSnapshot(records, currentRange, daysFilter);
  const previousSnapshot = computeSnapshot(records, previousRange, daysFilter);

  return {
    currentRange,
    previousRange,
    totalRecords: buildMetric(currentSnapshot.totalRecords, previousSnapshot.totalRecords),
    dailyAverage: buildMetric(currentSnapshot.dailyAverage, previousSnapshot.dailyAverage),
    weekdayAverage: buildMetric(currentSnapshot.weekdayAverage, previousSnapshot.weekdayAverage),
    weekendAverage: buildMetric(currentSnapshot.weekendAverage, previousSnapshot.weekendAverage),
    avgIntervalMs: buildMetric(currentSnapshot.avgIntervalMs, previousSnapshot.avgIntervalMs),
  };
}

// ---------------------------------------------------------------------------
// Gatilhos comportamentais (atividade x faixa horária x dia da semana)
// ---------------------------------------------------------------------------

export interface TriggerResult {
  activity: string;
  hourBucketLabel: string;
  topDays: string[];
  count: number;
  multiplier: number;
}

const MIN_TRIGGER_OCCURRENCES = 3;
const DAY_LABELS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function getHourBucket(hour: number): HourBucket {
  return HOUR_BUCKETS.find(b => hour >= b.startHour && hour < b.endHour) || HOUR_BUCKETS[HOUR_BUCKETS.length - 1];
}

/**
 * Cruza atividade + faixa horária; baseline = média de ocorrências entre combos
 * que de fato aconteceram (não sobre o total teórico de combinações possíveis,
 * o que infla o multiplicador em bases esparsas). Descarta combos com poucas
 * ocorrências para evitar "gatilhos" baseados em 1-2 eventos isolados.
 */
export function computeTriggerAnalysis(records: SmokingRecord[]): TriggerResult[] {
  interface ComboAcc {
    activity: string;
    hourBucketLabel: string;
    count: number;
    dayOfWeekCounts: number[];
  }
  const combos = new Map<string, ComboAcc>();

  records.forEach(r => {
    const d = new Date(r.dateTime);
    const bucket = getHourBucket(d.getHours());
    const key = `${r.activity}::${bucket.key}`;
    if (!combos.has(key)) {
      combos.set(key, { activity: r.activity, hourBucketLabel: bucket.label, count: 0, dayOfWeekCounts: Array(7).fill(0) });
    }
    const combo = combos.get(key)!;
    combo.count += 1;
    combo.dayOfWeekCounts[getDay(d)] += 1;
  });

  const comboList = Array.from(combos.values()).filter(c => c.count >= MIN_TRIGGER_OCCURRENCES);
  if (comboList.length === 0) return [];

  const totalOccurrences = comboList.reduce((s, c) => s + c.count, 0);
  const baseline = totalOccurrences / comboList.length;

  return comboList
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(c => {
      const maxDayCount = Math.max(...c.dayOfWeekCounts);
      const topDays = c.dayOfWeekCounts
        .map((count, i) => ({ count, label: DAY_LABELS_FULL[i] }))
        .filter(x => maxDayCount > 0 && x.count === maxDayCount)
        .map(x => x.label);
      return {
        activity: c.activity,
        hourBucketLabel: c.hourBucketLabel,
        topDays,
        count: c.count,
        multiplier: baseline > 0 ? c.count / baseline : 0,
      };
    });
}

// ---------------------------------------------------------------------------
// Heatmap hora x dia da semana
// ---------------------------------------------------------------------------

export interface HourDayHeatmapResult {
  matrix: number[][]; // [diaDaSemana][hora], 7x24
  max: number;
}

export function computeHourDayHeatmap(records: SmokingRecord[]): HourDayHeatmapResult {
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  records.forEach(r => {
    const d = new Date(r.dateTime);
    matrix[getDay(d)][getHours(d)] += 1;
  });
  const max = Math.max(1, ...matrix.flat());
  return { matrix, max };
}

// ---------------------------------------------------------------------------
// Humor
// ---------------------------------------------------------------------------

export interface MoodStat {
  mood: Mood;
  label: string;
  emoji: string;
  count: number;
  distinctDays: number;
  avgDaily: number;
}

export function computeMoodStats(records: SmokingRecord[]): MoodStat[] {
  return MOOD_OPTIONS.map(option => {
    const recordsWithMood = records.filter(r => r.mood === option.value);
    const distinctDays = new Set(recordsWithMood.map(r => new Date(r.dateTime).toDateString())).size;
    const avgDaily = distinctDays > 0 ? recordsWithMood.length / distinctDays : 0;
    return {
      mood: option.value,
      label: option.label,
      emoji: option.emoji,
      count: recordsWithMood.length,
      distinctDays,
      avgDaily,
    };
  });
}

const MIN_DISTINCT_DAYS_PER_MOOD = 3;
const MIN_INSIGHT_MULTIPLIER = 1.15;

/** Só gera um insight quando há amostra mínima em ambos os humores comparados, para evitar ruído. */
export function getMoodInsight(stats: MoodStat[]): string | null {
  const stressed = stats.find(s => s.mood === 'estressado');
  const calm = stats.find(s => s.mood === 'calmo');
  if (!stressed || !calm) return null;
  if (stressed.distinctDays < MIN_DISTINCT_DAYS_PER_MOOD || calm.distinctDays < MIN_DISTINCT_DAYS_PER_MOOD) return null;
  if (calm.avgDaily <= 0) return null;

  const multiplier = stressed.avgDaily / calm.avgDaily;
  if (multiplier <= MIN_INSIGHT_MULTIPLIER) return null;

  const formatted = multiplier.toFixed(1).replace('.', ',');
  return `Você fuma ${formatted}× mais quando marca "estressado".`;
}

// ---------------------------------------------------------------------------
// Notas
// ---------------------------------------------------------------------------

export function computeNoteStats(records: SmokingRecord[]): NameCount[] {
  const map: Record<string, number> = {};
  records.forEach(r => {
    if (r.note) {
      map[r.note] = (map[r.note] || 0) + 1;
    }
  });
  return Object.keys(map)
    .map(name => ({ name, count: map[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

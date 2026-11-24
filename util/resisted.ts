import { format, addDays, startOfDay, endOfDay, getDay } from 'date-fns';
import { AnalysisSelection, filterDays } from '../types';
import { getSelectionRange } from './analytics';

export interface ResistedDayPoint {
  /** `dd/MM`, mesmo formato do gráfico "Fumo por Dia". */
  date: string;
  count: number;
}

export interface ResistedSummary {
  total: number;
  /** Média por dia-calendário (string com 2 casas, como as outras médias). */
  perDay: string;
  daily: ResistedDayPoint[];
}

const matchesDaysFilter = (date: Date, daysFilter: filterDays): boolean => {
  const day = getDay(date);
  if (daysFilter === filterDays.WEEK_DAYS) return day !== 0 && day !== 6;
  if (daysFilter === filterDays.WEEKENDS) return day === 0 || day === 6;
  return true;
};

/**
 * Vontades seguradas no recorte da Análise, dia a dia (incluindo dias com zero).
 * Os dias começam na primeira vontade registrada (o recurso é novo, então dias
 * anteriores não teriam como ter dados) e vão até hoje, limitados pelo recorte
 * selecionado e pelo filtro de dias de semana/fim de semana.
 */
export function computeResistedSummary(
  resistedUrges: string[],
  selection: AnalysisSelection,
  daysFilter: filterDays,
  now: Date = new Date()
): ResistedSummary {
  const times = resistedUrges
    .map(d => new Date(d).getTime())
    .filter(t => !isNaN(t) && t <= now.getTime());
  if (times.length === 0) return { total: 0, perDay: '0.00', daily: [] };

  const range = getSelectionRange(selection, now);
  const firstDay = startOfDay(new Date(Math.min(...times)));
  const start = range && range.start > firstDay ? startOfDay(range.start) : firstDay;
  const end = range && range.end < now ? endOfDay(range.end) : endOfDay(now);

  const counts: Record<string, number> = {};
  times.forEach(t => {
    const date = new Date(t);
    if (t < start.getTime() || t > end.getTime() || !matchesDaysFilter(date, daysFilter)) return;
    const key = format(date, 'yyyy-MM-dd');
    counts[key] = (counts[key] || 0) + 1;
  });

  const daily: ResistedDayPoint[] = [];
  for (let cursor = start; cursor.getTime() <= end.getTime(); cursor = addDays(cursor, 1)) {
    if (!matchesDaysFilter(cursor, daysFilter)) continue;
    daily.push({ date: format(cursor, 'dd/MM'), count: counts[format(cursor, 'yyyy-MM-dd')] || 0 });
  }

  const total = daily.reduce((s, d) => s + d.count, 0);
  const perDay = daily.length ? (total / daily.length).toFixed(2) : '0.00';
  return { total, perDay, daily };
}

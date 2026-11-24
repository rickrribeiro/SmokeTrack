import { describe, it, expect } from 'vitest';
import { computeResistedSummary } from './resisted';
import { AnalysisMode, FilterRange, filterDays, AnalysisSelection } from '../types';

const local = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).toISOString();
// Quarta-feira, 25/11/2026 às 14h
const NOW = new Date(2026, 10, 25, 14);
const period = (periodo: FilterRange): AnalysisSelection => ({ mode: AnalysisMode.PERIOD, periodo });

describe('computeResistedSummary', () => {
  it('lista vazia não gera dias nem média', () => {
    expect(computeResistedSummary([], period(FilterRange.DAYS_7), filterDays.TOTAL, NOW))
      .toEqual({ total: 0, perDay: '0.00', daily: [] });
  });

  it('começa na primeira vontade, inclui dias com zero e vai até hoje', () => {
    const urges = [local(2026, 11, 23), local(2026, 11, 23, 18), local(2026, 11, 25, 9)];
    const r = computeResistedSummary(urges, period(FilterRange.DAYS_7), filterDays.TOTAL, NOW);
    expect(r.daily).toEqual([
      { date: '23/11', count: 2 },
      { date: '24/11', count: 0 },
      { date: '25/11', count: 1 },
    ]);
    expect(r.total).toBe(3);
    expect(r.perDay).toBe('1.00');
  });

  it('respeita o início do recorte selecionado', () => {
    const urges = [local(2026, 10, 1), local(2026, 11, 24)];
    const r = computeResistedSummary(urges, period(FilterRange.DAYS_3), filterDays.TOTAL, NOW);
    expect(r.daily[0].date).toBe('22/11');
    expect(r.daily).toHaveLength(4);
    expect(r.total).toBe(1);
  });

  it('modo mês limita aos dias do mês', () => {
    const urges = [local(2026, 10, 30), local(2026, 10, 31), local(2026, 11, 2)];
    const r = computeResistedSummary(urges, { mode: AnalysisMode.MONTH, month: '2026-10' }, filterDays.TOTAL, NOW);
    expect(r.daily.map(d => d.date)).toEqual(['30/10', '31/10']);
    expect(r.total).toBe(2);
  });

  it('filtro de fim de semana considera só sábados e domingos', () => {
    // 21/11 = sábado, 22/11 = domingo, 23/11 = segunda
    const urges = [local(2026, 11, 21), local(2026, 11, 23)];
    const r = computeResistedSummary(urges, period(FilterRange.TOTAL), filterDays.WEEKENDS, NOW);
    expect(r.daily.map(d => d.date)).toEqual(['21/11', '22/11']);
    expect(r.total).toBe(1);
    expect(r.perDay).toBe('0.50');
  });

  it('ignora datas futuras e inválidas', () => {
    const r = computeResistedSummary([local(2026, 11, 25, 9), local(2026, 12, 1), 'lixo'], period(FilterRange.DAYS_7), filterDays.TOTAL, NOW);
    expect(r.total).toBe(1);
    expect(r.daily).toHaveLength(1);
  });
});

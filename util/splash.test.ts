import { describe, it, expect } from 'vitest';
import { SmokingRecord } from '../types';
import { getLastRecordTime, countToday, countTodayRecords, pickRandomMessage } from './splash';
import { MOTIVATIONAL_MESSAGES } from './motivationalMessages';

const record = (dateTime: string, smokeType = 'Cigarro'): SmokingRecord => ({
  id: dateTime,
  smokeType,
  dateTime,
  activity: 'Trabalhando',
});

// Datas construídas no horário local para não depender do fuso da máquina.
const local = (y: number, m: number, d: number, h = 0, min = 0) =>
  new Date(y, m - 1, d, h, min).toISOString();

const NOW = new Date(2026, 10, 25, 14, 0);

describe('getLastRecordTime', () => {
  it('retorna null para lista vazia', () => {
    expect(getLastRecordTime([], NOW)).toBeNull();
  });

  it('usa o mais recente entre todos os registros, inclusive de dias anteriores', () => {
    const records = [record(local(2026, 11, 20, 9)), record(local(2026, 11, 24, 23, 30)), record(local(2026, 11, 22, 8))];
    expect(getLastRecordTime(records, NOW)).toBe(new Date(local(2026, 11, 24, 23, 30)).getTime());
  });

  it('considera qualquer tipo de registro', () => {
    const records = [record(local(2026, 11, 25, 9)), record(local(2026, 11, 25, 12), 'Chiclete de nicotina')];
    expect(getLastRecordTime(records, NOW)).toBe(new Date(local(2026, 11, 25, 12)).getTime());
  });

  it('ignora registros com data futura', () => {
    const records = [record(local(2026, 11, 25, 10)), record(local(2026, 11, 25, 18)), record(local(2027, 1, 1))];
    expect(getLastRecordTime(records, NOW)).toBe(new Date(local(2026, 11, 25, 10)).getTime());
  });

  it('retorna null se só houver registros futuros ou inválidos', () => {
    expect(getLastRecordTime([record(local(2026, 12, 1)), record('lixo')], NOW)).toBeNull();
  });
});

describe('countTodayRecords / countToday', () => {
  it('retorna 0 para lista vazia', () => {
    expect(countTodayRecords([], NOW)).toBe(0);
    expect(countToday([], NOW)).toBe(0);
  });

  it('conta só os registros do dia calendário (a partir da meia-noite)', () => {
    const records = [
      record(local(2026, 11, 25, 0, 5)),
      record(local(2026, 11, 25, 13)),
      record(local(2026, 11, 24, 23, 59)),
      record(local(2025, 11, 25, 13)),
    ];
    expect(countTodayRecords(records, NOW)).toBe(2);
  });

  it('registro mais tarde no mesmo dia (futuro) ainda conta como hoje; de outro dia não', () => {
    const records = [record(local(2026, 11, 25, 22)), record(local(2026, 11, 26, 1))];
    expect(countTodayRecords(records, NOW)).toBe(1);
  });
});

describe('mensagens motivacionais', () => {
  it('tem exatamente 30 mensagens, únicas e não vazias', () => {
    expect(MOTIVATIONAL_MESSAGES).toHaveLength(30);
    expect(new Set(MOTIVATIONAL_MESSAGES).size).toBe(30);
    MOTIVATIONAL_MESSAGES.forEach(m => expect(m.trim().length).toBeGreaterThan(0));
  });

  it('pickRandomMessage respeita o rng e os limites', () => {
    expect(pickRandomMessage(() => 0)).toBe(MOTIVATIONAL_MESSAGES[0]);
    expect(pickRandomMessage(() => 0.999999)).toBe(MOTIVATIONAL_MESSAGES[29]);
    expect(pickRandomMessage(() => 1)).toBe(MOTIVATIONAL_MESSAGES[29]);
    expect(pickRandomMessage(() => 0.5)).toBe(MOTIVATIONAL_MESSAGES[15]);
  });
});

import { describe, it, expect } from 'vitest';
import { SmokingRecord } from '../types';
import {
  getMonthKey,
  parseMonthKey,
  isValidMonthKey,
  getMonthRange,
  getPreviousMonthKey,
  formatMonthLabel,
  getAvailableMonthKeys,
} from './months';

const record = (dateTime: string): SmokingRecord => ({
  id: dateTime,
  smokeType: 'Cigarro',
  dateTime,
  activity: 'Trabalhando',
});

describe('chaves de mês', () => {
  it('gera a chave a partir de uma data local', () => {
    expect(getMonthKey(new Date(2026, 7, 11, 23, 30))).toBe('2026-08');
    expect(getMonthKey(new Date(2026, 0, 1, 0, 0))).toBe('2026-01');
  });

  it('valida o formato', () => {
    expect(isValidMonthKey('2026-08')).toBe(true);
    expect(isValidMonthKey('2026-13')).toBe(false);
    expect(isValidMonthKey('2026-00')).toBe(false);
    expect(isValidMonthKey('2026-8')).toBe(false);
    expect(isValidMonthKey('agosto')).toBe(false);
  });

  it('faz o parse para o primeiro instante do mês e rejeita chaves inválidas', () => {
    const parsed = parseMonthKey('2026-08');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(1);
    expect(() => parseMonthKey('2026-13')).toThrow();
    expect(() => parseMonthKey('2026-8')).toThrow();
  });

  it('calcula o intervalo do mês', () => {
    const { start, end } = getMonthRange('2026-02');
    expect(start.getTime()).toBe(new Date(2026, 1, 1, 0, 0, 0, 0).getTime());
    expect(end.getTime()).toBe(new Date(2026, 1, 28, 23, 59, 59, 999).getTime());
  });

  it('volta um mês atravessando a virada de ano', () => {
    expect(getPreviousMonthKey('2026-01')).toBe('2025-12');
    expect(getPreviousMonthKey('2026-08')).toBe('2026-07');
  });

  it('formata o rótulo em português com inicial maiúscula', () => {
    expect(formatMonthLabel('2026-08')).toBe('Agosto de 2026');
  });
});

describe('getAvailableMonthKeys', () => {
  const now = new Date(2026, 7, 11, 12, 0, 0);

  it('inclui o mês atual mesmo sem registros', () => {
    expect(getAvailableMonthKeys([], now)).toEqual(['2026-08']);
  });

  it('lista meses com registros sem duplicar, do mais recente para o mais antigo', () => {
    const records = [
      record('2026-06-01T10:00'),
      record('2026-06-20T10:00'),
      record('2025-12-31T23:00'),
      record('2026-08-02T10:00'),
    ];
    expect(getAvailableMonthKeys(records, now)).toEqual(['2026-08', '2026-06', '2025-12']);
  });

  it('ignora registros com data inválida', () => {
    expect(getAvailableMonthKeys([record('não é data')], now)).toEqual(['2026-08']);
  });
});

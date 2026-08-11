import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { SmokingRecord, DateRange } from '../types';

/** Formato das chaves de mês usadas no filtro de análise. */
export const MONTH_KEY_FORMAT = 'yyyy-MM';

const MONTH_KEY_PATTERN = /^(\d{4})-(\d{2})$/;

export function getMonthKey(date: Date): string {
  return format(date, MONTH_KEY_FORMAT);
}

export function isValidMonthKey(key: string): boolean {
  const match = MONTH_KEY_PATTERN.exec(key);
  if (!match) return false;
  const month = Number(match[2]);
  return month >= 1 && month <= 12;
}

/** Primeiro instante do mês no fuso local. */
export function parseMonthKey(key: string): Date {
  const match = MONTH_KEY_PATTERN.exec(key);
  if (!match || !isValidMonthKey(key)) {
    throw new Error(`Chave de mês inválida: "${key}" (esperado ${MONTH_KEY_FORMAT})`);
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, 1);
}

export function getMonthRange(key: string): DateRange {
  const first = parseMonthKey(key);
  return { start: startOfMonth(first), end: endOfMonth(first) };
}

export function getPreviousMonthKey(key: string): string {
  return getMonthKey(subMonths(parseMonthKey(key), 1));
}

/** Ex.: "2026-08" -> "Agosto de 2026". */
export function formatMonthLabel(key: string): string {
  const label = parseMonthKey(key).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Meses que têm registros, mais o mês atual (para que o mês corrente seja
 * sempre selecionável mesmo antes do primeiro registro). Mais recente primeiro.
 */
export function getAvailableMonthKeys(records: SmokingRecord[], now: Date = new Date()): string[] {
  const keys = new Set<string>([getMonthKey(now)]);
  records.forEach(r => {
    const date = new Date(r.dateTime);
    if (!Number.isNaN(date.getTime())) keys.add(getMonthKey(date));
  });
  return Array.from(keys).sort().reverse();
}

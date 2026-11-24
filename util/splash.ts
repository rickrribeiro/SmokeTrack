import { SmokingRecord } from '../types';
import { MOTIVATIONAL_MESSAGES } from './motivationalMessages';

/**
 * Retorna o timestamp (ms) do registro mais recente entre TODOS os registros
 * (não só os de hoje). Registros com data no futuro em relação a `now` e datas
 * inválidas são ignorados. Retorna null se não houver registro válido.
 */
export const getLastRecordTime = (
  records: SmokingRecord[],
  now: Date = new Date()
): number | null => {
  const nowMs = now.getTime();
  let last: number | null = null;
  for (const r of records) {
    const t = new Date(r.dateTime).getTime();
    if (isNaN(t) || t > nowMs) continue;
    if (last === null || t > last) last = t;
  }
  return last;
};

/** Conta quantas datas ISO caem no mesmo dia calendário (meia-noite local) de `now`. */
export const countToday = (dates: string[], now: Date = new Date()): number => {
  const today = now.toDateString();
  return dates.filter(d => new Date(d).toDateString() === today).length;
};

/** Quantos registros existem no dia calendário de `now` (mesma regra do RegisterScreen). */
export const countTodayRecords = (records: SmokingRecord[], now: Date = new Date()): number =>
  countToday(records.map(r => r.dateTime), now);

/** Sorteia uma mensagem motivacional. `rng` deve retornar um número em [0, 1). */
export const pickRandomMessage = (
  rng: () => number = Math.random,
  messages: readonly string[] = MOTIVATIONAL_MESSAGES
): string => {
  const index = Math.min(messages.length - 1, Math.max(0, Math.floor(rng() * messages.length)));
  return messages[index];
};

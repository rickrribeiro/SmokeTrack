const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Formata uma duração em milissegundos de forma legível em pt-BR.
 * - >= 1 dia -> "Xd Yh"
 * - >= 1 hora -> "Xh Ym"
 * - >= 1 minuto -> "Xm"
 * - > 0 e < 1 minuto -> "<1m"
 * - <= 0 -> "0m"
 */
const formatDuration = (ms: number): string => {
  const clamped = Math.max(0, ms);

  if (clamped >= DAY) {
    const days = Math.floor(clamped / DAY);
    const hours = Math.floor((clamped % DAY) / HOUR);
    return `${days}d ${hours}h`;
  }

  if (clamped >= HOUR) {
    const hours = Math.floor(clamped / HOUR);
    const minutes = Math.floor((clamped % HOUR) / MINUTE);
    return `${hours}h ${minutes}m`;
  }

  if (clamped >= MINUTE) {
    const minutes = Math.floor(clamped / MINUTE);
    return `${minutes}m`;
  }

  if (clamped > 0) {
    return '<1m';
  }

  return '0m';
};

export {
  formatDuration
}

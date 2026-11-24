import { describe, it, expect } from 'vitest';
import { normalizeAppData } from './dataMigration';

describe('normalizeAppData - resistedUrges', () => {
  it('não cria o campo quando ele não existe nos dados', () => {
    const data = normalizeAppData({ records: [] });
    expect('resistedUrges' in data).toBe(false);
  });

  it('preserva datas válidas e descarta entradas inválidas', () => {
    const data = normalizeAppData({
      records: [],
      resistedUrges: ['2026-11-25T10:00:00.000Z', 'lixo', 42, null],
    });
    expect(data.resistedUrges).toEqual(['2026-11-25T10:00:00.000Z']);
  });
});

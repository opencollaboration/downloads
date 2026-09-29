import { mapWithConcurrency } from '@/lib/concurrency';
import { describe, expect, it } from 'vitest';

describe('mapWithConcurrency', () => {
  it('returns an empty result for an empty list', async () => {
    expect(await mapWithConcurrency([], 3, async (item) => item)).toEqual([]);
  });

  it('preserves input order when requests finish out of order', async () => {
    const results = await mapWithConcurrency([3, 2, 1], 3, async (item) => {
      await new Promise((resolve) => setTimeout(resolve, item * 2));
      return item * 10;
    });
    expect(results).toEqual([30, 20, 10]);
  });

  it('never starts more work than the limit', async () => {
    let active = 0;
    let peak = 0;
    await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (item) => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active--;
      return item;
    });
    expect(peak).toBe(2);
  });

  it('handles a limit larger than the list', async () => {
    expect(await mapWithConcurrency([1, 2], 10, async (item) => item + 1)).toEqual([2, 3]);
  });

  it('propagates a mapping failure', async () => {
    await expect(
      mapWithConcurrency([1, 2], 2, async (item) => {
        if (item === 2) throw new Error('failed');
        return item;
      }),
    ).rejects.toThrow('failed');
  });
});

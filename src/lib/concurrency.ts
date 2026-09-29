/**
 * Apply an async function across items, keeping at most `limit` in flight.
 * Results are returned in input order.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  map: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = cursor++;
      const item = items[index];

      if (index >= items.length || item === undefined) {
        return;
      }

      results[index] = await map(item);
    }
  });

  await Promise.all(workers);

  return results;
}

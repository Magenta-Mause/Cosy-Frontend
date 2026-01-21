export function distinctBy<T, K>(
  items: T[],
  keySelector: (item: T) => K
): T[] {
  const seenKeys = new Set<K>();
  const result: T[] = [];

  for (const item of items) {
    const key = keySelector(item);
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      result.push(item);
    }
  }

  return result;
}

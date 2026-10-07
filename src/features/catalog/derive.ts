interface Pickable { id: string; dailyPickDate: string | null; dailyPickRank: number }

export function selectRecent<T extends Pickable>(products: readonly T[], today: string, excludeIds: ReadonlySet<string>, limit = 8): T[] {
  return products
    .filter((p) => p.dailyPickDate !== null && p.dailyPickDate < today && !excludeIds.has(p.id))
    .sort((a, b) => (b.dailyPickDate as string).localeCompare(a.dailyPickDate as string) || a.dailyPickRank - b.dailyPickRank || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function orderForGrid<T extends { available: boolean }>(items: readonly T[]): T[] {
  return [...items.filter((i) => i.available), ...items.filter((i) => !i.available)];
}

const STOP_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'para', 'com', 'e', 'a', 'o']);

export function normalize(input: string): string {
  return input.normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function buildSearchText(parts: ReadonlyArray<string | null | undefined>): string {
  return normalize(parts.filter((part): part is string => Boolean(part)).join(' '));
}

export function matches(searchText: string, query: string): boolean {
  const tokens = normalize(query).split(' ').filter((token) => token && !STOP_WORDS.has(token));
  return tokens.every((token) => searchText.includes(token));
}

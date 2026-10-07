import { useSyncExternalStore } from 'react';
import { matches } from '@/features/catalog/search';

export interface FilterState { query: string; category: string | null }
const INITIAL: FilterState = { query: '', category: null };
let state: FilterState = INITIAL;
const listeners = new Set<() => void>();

export const getFilterState = (): FilterState => state;
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function setFilter(patch: Partial<FilterState>): void {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
export const resetFilter = (): void => setFilter({ query: '', category: null });
export function isVisible(item: { searchText: string; categories: readonly string[] }, s: FilterState): boolean {
  return matches(item.searchText, s.query) && (s.category === null || item.categories.includes(s.category));
}
export const useFilter = (): FilterState => useSyncExternalStore(subscribe, getFilterState, () => INITIAL);

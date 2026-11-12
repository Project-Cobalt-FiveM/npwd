import { useCallback, useEffect, useState } from 'react';
import type { Evaluation } from '../utils/calculator';

export interface HistoryEntry extends Evaluation {
  id: string;
  at: number;
}

const storageKey = 'npwd:calculator:history';
const maxEntries = 50;

const isHistoryEntry = (value: unknown): value is HistoryEntry => {
  if (typeof value !== 'object' || value === null) return false;
  const { id, at, expression, result } = value as Record<string, unknown>;
  return (
    typeof id === 'string' &&
    typeof at === 'number' &&
    typeof expression === 'string' &&
    typeof result === 'number' &&
    Number.isFinite(result)
  );
};

const loadHistory = (): HistoryEntry[] => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isHistoryEntry).slice(0, maxEntries) : [];
  } catch {
    return [];
  }
};

const saveHistory = (entries: HistoryEntry[]): void => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(entries));
  } catch {
    return;
  }
};

export const useCalculatorHistory = () => {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory);

  useEffect(() => saveHistory(entries), [entries]);

  const add = useCallback((evaluation: Evaluation) => {
    const at = Date.now();
    setEntries((current) =>
      [{ ...evaluation, at, id: `${at}-${current.length}` }, ...current].slice(0, maxEntries),
    );
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, add, clear };
};

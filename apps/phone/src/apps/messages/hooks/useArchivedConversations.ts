import { useCallback, useEffect, useMemo } from 'react';
import { atom, AtomEffect, useRecoilState } from 'recoil';
import { MessageConversation } from '@typings/messages';

const storageKey = 'cobalt:messages:archived';

interface ArchivedEntry {
  id: number;
  unread: number;
}

const isEntry = (value: unknown): value is ArchivedEntry =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as ArchivedEntry).id === 'number' &&
  typeof (value as ArchivedEntry).unread === 'number';

const parseStored = (raw: string | null): ArchivedEntry[] => {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
};

const persist: AtomEffect<ArchivedEntry[]> = ({ setSelf, onSet }) => {
  setSelf(parseStored(localStorage.getItem(storageKey)));
  onSet((entries) => localStorage.setItem(storageKey, JSON.stringify(entries)));
};

const archivedEntries = atom<ArchivedEntry[]>({
  key: 'cobalt:messages:archived',
  default: [],
  effects: [persist],
});

export const useArchivedConversations = (conversations: MessageConversation[]) => {
  const [entries, setEntries] = useRecoilState(archivedEntries);
  const archivedIds = useMemo(() => entries.map((entry) => entry.id), [entries]);

  const archive = useCallback(
    (ids: number[]) =>
      setEntries((current) => [
        ...current.filter((entry) => !ids.includes(entry.id)),
        ...ids.map((id) => ({
          id,
          unread: conversations.find((conversation) => conversation.id === id)?.unreadCount ?? 0,
        })),
      ]),
    [conversations, setEntries],
  );

  const unarchive = useCallback(
    (ids: number[]) => setEntries((current) => current.filter((entry) => !ids.includes(entry.id))),
    [setEntries],
  );

  useEffect(() => {
    const unreadOf = (id: number): number =>
      conversations.find((conversation) => conversation.id === id)?.unreadCount ?? 0;
    const changed = entries.some((entry) => unreadOf(entry.id) !== entry.unread);
    if (!changed) return;
    setEntries(
      entries
        .filter((entry) => unreadOf(entry.id) <= entry.unread)
        .map((entry) => ({ id: entry.id, unread: unreadOf(entry.id) })),
    );
  }, [conversations, entries, setEntries]);

  return { archivedIds, archive, unarchive };
};

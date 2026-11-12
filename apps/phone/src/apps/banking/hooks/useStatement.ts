import { useCallback, useEffect, useRef, useState } from 'react';
import { BankingDirection, BankingEntry } from '@typings/banking';
import { bankingApi } from './bankingApi';
import { useAccountRevision } from './state';

export type StatementStatus = 'loading' | 'ready' | 'error';

export interface Statement {
  entries: BankingEntry[];
  status: StatementStatus;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
  reload: () => void;
}

export const useStatement = (accountId: string, direction: BankingDirection): Statement => {
  const revision = useAccountRevision(accountId);
  const [entries, setEntries] = useState<BankingEntry[]>([]);
  const [status, setStatus] = useState<StatementStatus>('loading');
  const [cursor, setCursor] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const request = useRef(0);

  useEffect(() => {
    const id = ++request.current;
    if (revision === 0) setStatus('loading');

    bankingApi.statement(accountId, direction).then((result) => {
      if (id !== request.current) return;
      if ('reason' in result) {
        setStatus((current) => (current === 'ready' ? current : 'error'));
        return;
      }

      setEntries(result.data.entries);
      setCursor(result.data.nextCursor);
      setStatus('ready');
    });
  }, [accountId, direction, revision, attempt]);

  const loadMore = useCallback(() => {
    if (cursor === null || loadingMore) return;
    const id = request.current;
    setLoadingMore(true);

    bankingApi.statement(accountId, direction, cursor).then((result) => {
      setLoadingMore(false);
      if (id !== request.current || 'reason' in result) return;
      setEntries((current) => [...current, ...result.data.entries]);
      setCursor(result.data.nextCursor);
    });
  }, [accountId, direction, cursor, loadingMore]);

  const reload = useCallback(() => {
    setStatus('loading');
    setAttempt((current) => current + 1);
  }, []);

  return { entries, status, hasMore: cursor !== null, loadingMore, loadMore, reload };
};

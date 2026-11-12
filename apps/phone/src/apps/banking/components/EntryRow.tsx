import React from 'react';
import { BankingEntry } from '@typings/banking';
import { cn } from '@utils/css';
import { useText } from '@apps/gallery/hooks/useText';
import { dayDistance, formatDayMonth, formatSigned, formatTime } from '../utils/format';
import { FOCUS_RING, MONEY_IN, rowClass } from './parts';

export const entryTitle = (entry: BankingEntry, text: (key: string) => string): string =>
  entry.counterparty?.name ?? text(`COBALT.BANKING.ENTRY_${entry.type.toUpperCase()}`);

const entryWhen = (seconds: number, text: (key: string) => string): string => {
  const distance = dayDistance(seconds);
  const day =
    distance === 0
      ? text('COBALT.BANKING.TODAY')
      : distance === 1
      ? text('COBALT.BANKING.YESTERDAY')
      : formatDayMonth(seconds);
  return `${day} ${formatTime(seconds)}`;
};

export const EntryRow: React.FC<{ entry: BankingEntry; first: boolean; onOpen: () => void }> = ({
  entry,
  first,
  onOpen,
}) => {
  const text = useText();
  const subtitle = [entryWhen(entry.createdAt, text), entry.note].filter(Boolean).join(' · ');

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(rowClass(first), 'active:bg-[#DCDEDC]', FOCUS_RING)}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[15px] leading-5">{entryTitle(entry, text)}</span>
        <span className="truncate text-xs leading-4 text-[#555A55]">{subtitle}</span>
      </span>
      <span
        className="shrink-0 text-[15px] tabular-nums leading-5"
        style={{ color: entry.amount > 0 ? MONEY_IN : '#1E201E' }}
      >
        {formatSigned(entry.amount)}
      </span>
    </button>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClockCounterClockwise, Trash } from '@phosphor-icons/react';
import { BottomSheet, EmptyState } from '@ui/cobalt';
import type { HistoryEntry } from '../hooks/useCalculatorHistory';
import { formatNumber } from '../utils/calculator';

interface HistorySheetProps {
  open: boolean;
  entries: HistoryEntry[];
  onClose: () => void;
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

interface DayGroup {
  key: string;
  at: number;
  entries: HistoryEntry[];
}

const dayKey = (at: number): string => new Date(at).toDateString();

const groupByDay = (entries: HistoryEntry[]): DayGroup[] =>
  entries.reduce<DayGroup[]>((groups, entry) => {
    const key = dayKey(entry.at);
    const last = groups[groups.length - 1];
    if (last?.key === key) last.entries.push(entry);
    else groups.push({ key, at: entry.at, entries: [entry] });
    return groups;
  }, []);

export const HistorySheet: React.FC<HistorySheetProps> = ({
  open,
  entries,
  onClose,
  onSelect,
  onClear,
}) => {
  const [t] = useTranslation();
  const historyLabel: string = t('COBALT.CALCULATOR.HISTORY');
  const countLabel: string = t('COBALT.CALCULATOR.HISTORY_COUNT', { count: entries.length });
  const clearLabel: string = t('COBALT.CALCULATOR.CLEAR_HISTORY');

  const dayLabel = (at: number): string => {
    const today = Date.now();
    if (dayKey(at) === dayKey(today)) return String(t('COBALT.CALCULATOR.TODAY'));
    if (dayKey(at) === dayKey(today - 86_400_000)) return String(t('COBALT.CALCULATOR.YESTERDAY'));
    return new Date(at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const title = (
    <span className="flex items-center justify-between">
      <span>{historyLabel}</span>
      {entries.length > 0 && (
        <span className="text-xs font-normal tabular-nums text-cb-muted-foreground">
          {countLabel}
        </span>
      )}
    </span>
  );

  return (
    <BottomSheet open={open} onClose={onClose} title={title} className="h-[520px]">
      {entries.length === 0 ? (
        <EmptyState
          icon={<ClockCounterClockwise size={22} weight="fill" />}
          title={t('COBALT.CALCULATOR.HISTORY_EMPTY')}
          className="h-full justify-center"
        />
      ) : (
        <div className="flex min-h-full flex-col">
          <div className="flex-1 px-3">
            {groupByDay(entries).map((group) => (
              <section key={group.key}>
                <h3 className="pb-1 pt-3 text-xs font-medium text-cb-muted-foreground">
                  {dayLabel(group.at)}
                </h3>
                <ul>
                  {group.entries.map((entry) => (
                    <li key={entry.id} className="border-b border-cb-border last:border-b-0">
                      <button
                        type="button"
                        onClick={() => onSelect(entry)}
                        className="flex w-full flex-col items-end rounded-md py-2 tabular-nums transition-colors duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary active:bg-cb-muted"
                      >
                        <span className="text-sm text-cb-muted-foreground">{entry.expression}</span>
                        <span className="text-xl font-semibold leading-7 text-cb-foreground">
                          {formatNumber(entry.result)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <div className="sticky bottom-0 -mb-4 border-t border-cb-border bg-cb-popover px-3 pb-4 pt-3">
            <button
              type="button"
              onClick={onClear}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-cb-input bg-cb-secondary text-sm font-medium text-cb-foreground transition-colors duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary active:bg-cb-input"
            >
              <Trash size={16} weight="fill" />
              {clearLabel}
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
};

import dayjs from 'dayjs';
import { CallHistoryItem } from '@typings/call';

export type CallKind = 'incoming' | 'outgoing' | 'missed';

export interface CallLogEntry {
  key: string;
  kind: CallKind;
  peer: string;
  anonymous: boolean;
  startedAt: dayjs.Dayjs;
  durationSeconds: number | null;
  count: number;
}

export interface CallLogGroup {
  period: 'today' | 'earlier';
  entries: CallLogEntry[];
}

const toEntry = (call: CallHistoryItem, myNumber: string): CallLogEntry => {
  const outgoing = call.transmitter === myNumber;
  const start = Number(call.start);
  const end = call.end != null ? Number(call.end) : null;
  return {
    key: String(call.id ?? call.identifier ?? `${call.transmitter}-${call.start}`),
    kind: outgoing ? 'outgoing' : call.is_accepted ? 'incoming' : 'missed',
    peer: outgoing ? call.receiver : call.transmitter,
    anonymous: !outgoing && Boolean(call.isAnonymous),
    startedAt: dayjs.unix(start),
    durationSeconds: call.is_accepted && end != null && end > start ? end - start : null,
    count: 1,
  };
};

export const buildCallLog = (calls: CallHistoryItem[], myNumber: string): CallLogEntry[] =>
  calls
    .map((call) => toEntry(call, myNumber))
    .sort((a, b) => b.startedAt.valueOf() - a.startedAt.valueOf())
    .reduce<CallLogEntry[]>((log, entry) => {
      const previous = log[log.length - 1];
      const sameRun =
        previous &&
        previous.kind === entry.kind &&
        previous.peer === entry.peer &&
        previous.anonymous === entry.anonymous &&
        previous.startedAt.isSame(entry.startedAt, 'day');
      if (sameRun) {
        log[log.length - 1] = { ...previous, count: previous.count + 1 };
        return log;
      }
      return [...log, entry];
    }, []);

export const groupByPeriod = (entries: CallLogEntry[]): CallLogGroup[] => {
  const today = dayjs();
  const groups: CallLogGroup[] = [
    { period: 'today', entries: entries.filter((entry) => entry.startedAt.isSame(today, 'day')) },
    { period: 'earlier', entries: entries.filter((entry) => !entry.startedAt.isSame(today, 'day')) },
  ];
  return groups.filter((group) => group.entries.length > 0);
};

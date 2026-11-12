import { CallHistoryItem } from '@typings/call';

const myNumber = '111-1134';
const now = Math.floor(Date.now() / 1000);
const minutesAgo = (minutes: number) => now - minutes * 60;

const mockCall = (
  id: number,
  peer: string,
  direction: 'in' | 'out',
  accepted: boolean,
  startedMinutesAgo: number,
  durationMinutes: number,
): CallHistoryItem => {
  const start = minutesAgo(startedMinutesAgo);
  return {
    id,
    identifier: `mock-call-${id}`,
    transmitter: direction === 'out' ? myNumber : peer,
    receiver: direction === 'out' ? peer : myNumber,
    is_accepted: accepted,
    start: start.toString(),
    end: accepted ? start + durationMinutes * 60 : undefined,
  };
};

export const MockHistoryData: CallHistoryItem[] = [
  mockCall(1, '555-0142', 'in', true, 24, 4),
  mockCall(2, '555-0187', 'in', false, 40, 0),
  mockCall(3, '555-0187', 'in', false, 41, 0),
  mockCall(4, '555-0198', 'out', true, 122, 12),
  mockCall(5, '555-0176', 'out', true, 26 * 60, 1),
  mockCall(6, '555-0131', 'in', false, 27 * 60, 0),
  mockCall(7, '555-0110', 'in', true, 3 * 24 * 60, 2),
  mockCall(8, '555-0164', 'out', true, 4 * 24 * 60, 6),
];

import dayjs, { Dayjs } from 'dayjs';
import { Translate } from '../hooks/useText';

export const toMillis = (value: number): number => (value < 1e12 ? value * 1000 : value);

const toDay = (value: number): Dayjs => dayjs(toMillis(value));

const isYesterday = (day: Dayjs): boolean => day.isSame(dayjs().subtract(1, 'day'), 'day');

export const formatMessageTime = (value: number): string => toDay(value).format('H:mm');

export const dayKey = (value: number): string => toDay(value).format('YYYY-MM-DD');

export const formatConversationTime = (value: number, t: Translate): string => {
  const day = toDay(value);
  if (day.isSame(dayjs(), 'day')) return day.format('H:mm');
  if (isYesterday(day)) return t('COBALT.MESSAGES.YESTERDAY');
  if (dayjs().diff(day, 'day') < 7) return day.format('ddd');
  return day.format('MMM D');
};

export const formatDaySeparator = (value: number, t: Translate): string => {
  const day = toDay(value);
  if (day.isSame(dayjs(), 'day')) return t('COBALT.MESSAGES.TODAY');
  if (isYesterday(day)) return t('COBALT.MESSAGES.YESTERDAY');
  if (day.isSame(dayjs(), 'year')) return day.format('dddd, MMM D');
  return day.format('MMM D, YYYY');
};

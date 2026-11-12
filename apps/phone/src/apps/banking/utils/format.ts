const MINUS = '−';

const dollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const formatMoney = (amount: number): string => {
  const text = dollars.format(Math.abs(amount));
  return amount < 0 ? `${MINUS}${text}` : text;
};

export const formatSigned = (amount: number): string =>
  amount > 0 ? `+${formatMoney(amount)}` : formatMoney(amount);

export const accountDigits = (accountId: string): string => accountId.replace(/^CB\s*/i, '');

export const endingDigits = (accountId: string): string =>
  accountDigits(accountId).replace(/\s/g, '').slice(-4);

export const normaliseRecipient = (input: string): string => {
  const trimmed = input.trim().toUpperCase();
  const digits = trimmed.replace(/^CB/, '').replace(/\s/g, '');
  return /^\d{8}$/.test(digits) ? `CB ${digits.slice(0, 4)} ${digits.slice(4)}` : trimmed;
};

const DAY = 86_400_000;

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export const dayDistance =(seconds: number, now = new Date()): number =>
  Math.round((startOfDay(now) - startOfDay(new Date(seconds * 1000))) / DAY);

export const formatTime = (seconds: number): string =>
  new Date(seconds * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const formatDayMonth = (seconds: number): string =>
  new Date(seconds * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const formatWeekday = (seconds: number): string =>
  new Date(seconds * 1000).toLocaleDateString('en-GB', { weekday: 'short' });

export const formatFullDate = (seconds: number): string => {
  const date = new Date(seconds * 1000);
  return `${date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}, ${formatTime(seconds)}`;
};

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import usePhoneTime from './usePhoneTime';

export interface PhoneClock {
  time: string;
  longDate: string;
  shortDate: string;
}

export const usePhoneClock = (): PhoneClock => {
  const gameTime = usePhoneTime();
  const [now, setNow] = useState(() => dayjs());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(dayjs()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return {
    time: gameTime ?? now.format('HH:mm'),
    longDate: now.format('dddd, D MMMM'),
    shortDate: now.format('ddd, D MMM'),
  };
};

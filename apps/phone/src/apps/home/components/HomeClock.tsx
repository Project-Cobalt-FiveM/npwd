import React from 'react';
import { usePhoneClock } from '@os/phone/hooks/usePhoneClock';

export const HomeClock: React.FC = () => {
  const { time, longDate } = usePhoneClock();

  return (
    <div className="flex flex-col gap-1 px-2">
      <span className="text-[56px] font-semibold leading-[60px] tracking-[-0.03em] text-cb-background tabular-nums">
        {time}
      </span>
      <span className="text-sm font-medium text-cb-secondary">{longDate}</span>
    </div>
  );
};

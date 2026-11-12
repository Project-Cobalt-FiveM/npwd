import React from 'react';
import { useText } from '../../hooks/useText';
import { cn } from '@utils/css';
import '@fontsource/ubuntu/400.css';
import '@fontsource/ubuntu/700.css';

const wordmarkSizes = {
  header: { height: 36, radius: 7, paddingInline: 11, fontSize: 21, lineHeight: 24 },
  dialog: { height: 52, radius: 10, paddingInline: 16, fontSize: 31, lineHeight: 36 },
  splash: { height: 75, radius: 14, paddingInline: 28, fontSize: 44, lineHeight: 52 },
} as const;

export type WordmarkSize = keyof typeof wordmarkSizes;

export const LifeInvaderWordmark: React.FC<{ size?: WordmarkSize }> = ({ size = 'header' }) => {
  const { height, radius, paddingInline, fontSize, lineHeight } = wordmarkSizes[size];

  return (
    <div
      className="relative flex shrink-0 items-center overflow-hidden bg-[#D40604]"
      style={{ height, borderRadius: radius, paddingInline }}
      role="img"
      aria-label="Lifeinvader"
    >
      <span className="absolute inset-x-0 top-0 h-1/2 bg-[#E2544F]" />
      <span
        className="relative font-['Ubuntu',system-ui,sans-serif] font-normal text-white"
        style={{ fontSize, lineHeight: `${lineHeight}px` }}
      >
        <span className="font-bold">Life</span>invader
      </span>
    </div>
  );
};

export const LifeInvaderTagline: React.FC<{ className?: string }> = ({ className }) => {
  const t = useText();
  return (
    <p className={cn("font-['Ubuntu',system-ui,sans-serif] text-[#D40604]", className)}>
      {t('COBALT.LIFEINVADER.TAGLINE')}
    </p>
  );
};

export const LifeInvaderSplash: React.FC = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-[14px] bg-white pb-10">
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-[#D40604]">
      <span className="absolute inset-x-0 top-0 h-[30px] bg-[#E2544F]" />
      <span
        className="relative font-['Ubuntu',system-ui,sans-serif] text-[44px] font-bold leading-[44px] text-white"
        style={{ WebkitTextStroke: '1.5px #D40604' }}
      >
        L
      </span>
    </div>
    <LifeInvaderWordmark size="splash" />
    <LifeInvaderTagline className="text-lg leading-6" />
  </div>
);

import React from 'react';
import { cn } from '@utils/css';

export type CalculatorKeyTone = 'digit' | 'function' | 'operator' | 'primary';

interface CalculatorButtonProps {
  label: string;
  tone: CalculatorKeyTone;
  selected?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

const toneClasses: Record<CalculatorKeyTone, string> = {
  digit: 'bg-cb-muted text-[28px] font-medium text-cb-foreground active:bg-cb-secondary',
  function: 'bg-cb-secondary text-[28px] font-medium text-cb-foreground active:bg-cb-input',
  operator: 'bg-cb-secondary text-[32px] text-cb-cobalt-foreground active:bg-cb-input',
  primary: 'bg-cb-primary text-[32px] text-cb-foreground active:bg-cb-primary-hover',
};

export const CalculatorButton: React.FC<CalculatorButtonProps> = ({
  label,
  tone,
  selected,
  onPress,
  children,
}) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={tone === 'operator' ? Boolean(selected) : undefined}
    onClick={onPress}
    className={cn(
      'flex h-[72px] w-[72px] shrink-0 select-none items-center justify-center rounded-full tabular-nums leading-9 transition-[background-color,color,transform] duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-cobalt-foreground active:scale-95',
      toneClasses[tone],
      selected && 'bg-cb-primary text-cb-foreground active:bg-cb-primary-hover',
    )}
  >
    {children}
  </button>
);

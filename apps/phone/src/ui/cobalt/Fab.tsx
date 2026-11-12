import React from 'react';
import { cn } from '@utils/css';

const fabBase =
  'flex h-14 shrink-0 items-center justify-center rounded-2xl bg-cb-primary text-cb-foreground shadow-[0_6px_12px_-4px_#000000] transition-[background-color,transform] duration-150 ease-cb hover:bg-cb-primary-hover active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-foreground';

const fabPosition = 'absolute bottom-4 right-4 z-10';

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: React.ReactNode;
  floating?: boolean;
}

export const Fab: React.FC<FabProps> = ({
  label,
  icon,
  floating = true,
  className,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={cn(fabBase, 'w-14', floating && fabPosition, className)}
    {...rest}
  >
    {icon}
  </button>
);

export const ExtendedFab: React.FC<FabProps> = ({
  label,
  icon,
  floating = true,
  className,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    className={cn(fabBase, 'gap-3 pl-4 pr-5 text-sm font-semibold', floating && fabPosition, className)}
    {...rest}
  >
    {icon}
    <span>{label}</span>
  </button>
);

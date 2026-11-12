import React from 'react';
import { cn } from '@utils/css';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  label,
  active,
  className,
  children,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={cn(
      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-cb-muted-foreground transition-colors duration-150 ease-cb hover:text-cb-foreground active:bg-cb-input active:text-cb-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary',
      active && 'bg-cb-input text-cb-foreground',
      className,
    )}
    {...rest}
  >
    {children}
  </button>
);

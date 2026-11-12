import React from 'react';
import { cn } from '@utils/css';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  caption?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, caption, action, className }) => (
  <div className={cn('flex flex-col items-center gap-3 px-6 py-8 text-center', className)}>
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cb-secondary text-cb-muted-foreground">
      {icon}
    </div>
    <div className="flex flex-col items-center gap-1">
      <p className="text-sm font-medium text-cb-foreground">{title}</p>
      {caption && <p className="text-xs text-cb-muted-foreground">{caption}</p>}
    </div>
    {action && (
      <button
        type="button"
        onClick={action.onClick}
        className="mt-1 h-9 rounded-full bg-cb-primary px-4 text-sm font-medium text-cb-foreground transition-colors duration-150 ease-cb hover:bg-cb-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-foreground"
      >
        {action.label}
      </button>
    )}
  </div>
);

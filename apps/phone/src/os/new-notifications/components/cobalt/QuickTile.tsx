import React from 'react';
import type { Icon } from '@phosphor-icons/react';
import { cn } from '@utils/css';

interface QuickTileProps {
  icon: Icon;
  label: string;
  stateLabel: string;
  on: boolean;
  onToggle: () => void;
}

export const QuickTile: React.FC<QuickTileProps> = ({
  icon: TileIcon,
  label,
  stateLabel,
  on,
  onToggle,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    onClick={onToggle}
    className={cn(
      'flex h-16 w-[calc(50%-4px)] items-center gap-3 rounded-full px-4 text-left transition-colors duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-foreground',
      on ? 'bg-cb-primary hover:bg-cb-primary-hover' : 'bg-cb-secondary hover:bg-cb-input',
    )}
  >
    <TileIcon
      size={20}
      weight="fill"
      className={cn('shrink-0', on ? 'text-cb-foreground' : 'text-cb-muted-foreground')}
    />
    <span className="flex min-w-0 flex-col">
      <span className="truncate text-sm font-semibold text-cb-foreground">{label}</span>
      <span className={cn('text-xs', on ? 'text-cb-foreground' : 'text-cb-muted-foreground')}>
        {stateLabel}
      </span>
    </span>
  </button>
);

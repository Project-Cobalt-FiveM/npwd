import React from 'react';
import { BottomSheet } from '@ui/cobalt';
import { cn } from '@utils/css';

export interface SheetAction {
  label: string;
  icon: React.ReactNode;
  onSelect: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  actions: SheetAction[];
}

export const ActionSheet: React.FC<ActionSheetProps> = ({ open, onClose, actions }) => (
  <BottomSheet open={open} onClose={onClose}>
    <ul className="flex flex-col">
      {actions.map((action) => (
        <li key={action.label}>
          <button
            type="button"
            onClick={() => {
              onClose();
              action.onSelect();
            }}
            className={cn(
              'flex h-12 w-full items-center gap-4 rounded-xl px-4 text-left text-base transition-colors duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary active:bg-cb-secondary',
              action.destructive ? 'text-cb-destructive' : 'text-cb-foreground',
            )}
          >
            <span
              className={cn(
                'flex w-6 shrink-0 justify-center',
                !action.destructive && 'text-cb-muted-foreground',
              )}
            >
              {action.icon}
            </span>
            {action.label}
          </button>
        </li>
      ))}
    </ul>
  </BottomSheet>
);

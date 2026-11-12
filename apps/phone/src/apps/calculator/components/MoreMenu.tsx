import React from 'react';
import { usePresence } from '@ui/cobalt';
import { cn } from '@utils/css';

export interface MoreMenuItem {
  label: string;
  disabled?: boolean;
  onSelect: () => void;
}

interface MoreMenuProps {
  open: boolean;
  onClose: () => void;
  items: MoreMenuItem[];
}

export const MoreMenu: React.FC<MoreMenuProps> = ({ open, onClose, items }) => {
  const { mounted, shown } = usePresence(open, 150);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-30" onClick={onClose}>
      <ul
        role="menu"
        className={cn(
          'absolute right-2 top-14 min-w-[200px] origin-top-right rounded-lg border border-cb-border bg-cb-popover py-2 shadow-[0_8px_16px_-8px_#000000] transition-[opacity,transform] duration-150 ease-cb',
          shown ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {items.map((item) => (
          <li key={item.label} role="none">
            <button
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                item.onSelect();
                onClose();
              }}
              className="flex h-12 w-full items-center px-4 text-left text-sm text-cb-foreground transition-colors duration-150 ease-cb focus-visible:bg-cb-muted focus-visible:outline-none active:bg-cb-muted disabled:text-cb-muted-foreground"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

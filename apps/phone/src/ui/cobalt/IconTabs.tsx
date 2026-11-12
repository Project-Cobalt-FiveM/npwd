import React from 'react';
import type { Icon } from '@phosphor-icons/react';
import { cn } from '@utils/css';

export interface IconTab<T extends string> {
  value: T;
  label: string;
  icon: Icon;
  badge?: boolean;
}

export interface IconTabsProps<T extends string> {
  tabs: ReadonlyArray<IconTab<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export const IconTabs = <T extends string>({ tabs, value, onChange, className }: IconTabsProps<T>) => (
  <nav
    role="tablist"
    className={cn('flex h-14 w-full shrink-0 border-t border-cb-border bg-cb-background', className)}
  >
    {tabs.map(({ value: tabValue, label, icon: TabIcon, badge }) => {
      const selected = tabValue === value;
      return (
        <button
          key={tabValue}
          type="button"
          role="tab"
          aria-selected={selected}
          aria-label={label}
          title={label}
          onClick={() => onChange(tabValue)}
          className={cn(
            'relative flex flex-1 items-center justify-center transition-colors duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cb-primary',
            selected ? 'text-cb-primary' : 'text-cb-muted-foreground hover:text-cb-foreground',
          )}
        >
          <span className="relative">
            <TabIcon size={24} weight="fill" />
            {badge && (
              <span className="absolute -right-1 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-cb-background bg-cb-primary" />
            )}
          </span>
        </button>
      );
    })}
  </nav>
);

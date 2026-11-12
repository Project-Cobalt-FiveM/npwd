import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IApp } from '@os/apps/config/apps';
import { AppTile } from '@ui/cobalt';

interface RecentAppCardProps {
  app: IApp;
  index: number;
  onOpen: () => void;
}

export const RecentAppCard = forwardRef<HTMLDivElement, RecentAppCardProps>(
  ({ app, index, onOpen }, ref) => {
    const [t] = useTranslation();
    const name: string = t(app.nameLocale);

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label={name}
        data-card-index={index}
        onKeyDown={(event) => event.key === 'Enter' && onOpen()}
        className="flex h-full w-full select-none flex-col gap-2.5 will-change-transform focus-visible:outline-none"
      >
        <div className="flex items-center gap-2">
          <AppTile app={app} size={24} />
          <span className="truncate text-sm font-medium text-cb-background">{name}</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-cb-input bg-cb-background p-3.5">
          <AppTile app={app} size={72} />
          <span className="text-sm font-medium text-cb-muted-foreground">{name}</span>
        </div>
      </div>
    );
  },
);

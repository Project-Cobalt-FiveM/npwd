import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IApp } from '@os/apps/config/apps';
import { AppTile } from '@ui/cobalt';

interface HomeAppCellProps {
  app: IApp;
  unread: boolean;
}

export const HomeAppCell: React.FC<HomeAppCellProps> = ({ app, unread }) => {
  const [t] = useTranslation();
  const name = t(app.nameLocale);

  return (
    <Link
      to={app.path}
      aria-label={unread ? `${name}, ${t('COBALT.UNREAD')}` : name}
      className="group flex w-[92px] shrink-0 flex-col items-center gap-2 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary"
    >
      <span className="relative transition-transform duration-150 ease-cb group-active:scale-95">
        <AppTile app={app} />
        {unread && (
          <span className="absolute left-12 top-[-3px] h-3.5 w-3.5 rounded-full border-2 border-cb-card bg-cb-primary" />
        )}
      </span>
      <span className="max-w-full truncate text-xs font-medium text-cb-foreground">{name}</span>
    </Link>
  );
};

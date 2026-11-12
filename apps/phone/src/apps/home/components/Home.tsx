import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApps } from '@os/apps/hooks/useApps';
import { useExternalApps } from '@common/hooks/useExternalApps';
import { useUnreadAppIds } from '@os/apps/hooks/useUnreadAppIds';
import { IApp } from '@os/apps/config/apps';
import { DOCK_APP_IDS, GRID_APP_ORDER } from '../homeLayout';
import { HomeAppCell } from './HomeAppCell';
import { HomeClock } from './HomeClock';
import { HomeSearch } from './HomeSearch';

const dockIds: ReadonlyArray<string> = DOCK_APP_IDS;
const gridOrder: ReadonlyArray<string> = GRID_APP_ORDER;

const orderIndex = (id: string) => {
  const index = gridOrder.indexOf(id);
  return index === -1 ? gridOrder.length : index;
};

export const HomeApp: React.FC = () => {
  const [t] = useTranslation();
  const { apps } = useApps();
  const externalApps = useExternalApps();
  const [query, setQuery] = useState('');

  const visibleApps = useMemo<IApp[]>(
    () => [...apps, ...externalApps].filter((app) => !app.isDisabled),
    [apps, externalApps],
  );
  const unreadIds = useUnreadAppIds(visibleApps);

  const dockApps = useMemo(
    () => dockIds.map((id) => visibleApps.find((app) => app.id === id)).filter(Boolean),
    [visibleApps],
  );

  const gridApps = useMemo(
    () =>
      visibleApps
        .filter((app) => !dockIds.includes(app.id))
        .sort((a, b) => orderIndex(a.id) - orderIndex(b.id)),
    [visibleApps],
  );

  const trimmedQuery = query.trim().toLowerCase();
  const searchResults = useMemo(
    () =>
      trimmedQuery
        ? visibleApps.filter((app) => t(app.nameLocale).toLowerCase().includes(trimmedQuery))
        : [],
    [visibleApps, trimmedQuery, t],
  );

  const noMatchLabel: string = t('COBALT.NO_APPS_MATCH');

  const renderCells = (list: IApp[]) =>
    list.map((app) => <HomeAppCell key={app.id} app={app} unread={unreadIds.has(app.id)} />);

  return (
    <div className="flex h-full w-full flex-col gap-6 px-4 pb-4 pt-10">
      <HomeClock />
      <div className="flex-1" />
      {trimmedQuery && searchResults.length > 0 && (
        <div className="flex flex-wrap gap-y-5">{renderCells(searchResults)}</div>
      )}
      {trimmedQuery && searchResults.length === 0 && (
        <p className="rounded-full bg-cb-muted px-4 py-2 text-center text-sm text-cb-muted-foreground">
          {noMatchLabel}
        </p>
      )}
      {!trimmedQuery && (
        <>
          <div className="flex flex-wrap gap-y-5">{renderCells(gridApps)}</div>
          <div className="flex w-full">{renderCells(dockApps)}</div>
        </>
      )}
      <HomeSearch query={query} onQueryChange={setQuery} />
    </div>
  );
};

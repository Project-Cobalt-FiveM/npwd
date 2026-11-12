import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useApps } from '@os/apps/hooks/useApps';
import { useExternalApps } from '@common/hooks/useExternalApps';
import { IApp } from '@os/apps/config/apps';

const matchesPath = (pathname: string, appPath: string) =>
  pathname === appPath || pathname.startsWith(`${appPath}/`);

export const findAppForPath = (apps: IApp[], pathname: string): IApp | null =>
  apps
    .filter((app) => app.path && app.path !== '/' && matchesPath(pathname, app.path))
    .sort((a, b) => b.path.length - a.path.length)[0] ?? null;

export const useAllApps = (): IApp[] => {
  const { apps } = useApps();
  const externalApps = useExternalApps();
  return useMemo(() => [...apps, ...externalApps], [apps, externalApps]);
};

export const useCurrentApp = (): IApp | null => {
  const allApps = useAllApps();
  const { pathname } = useLocation();
  return useMemo(() => findAppForPath(allApps, pathname), [allApps, pathname]);
};

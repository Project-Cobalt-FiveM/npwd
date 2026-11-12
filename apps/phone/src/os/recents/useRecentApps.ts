import { useCallback, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { RecentApp, useRecentAppsValue, useRecentsOpen, useSetRecentApps } from './state';
import { useCurrentApp } from './useCurrentApp';

export const useRecentAppsTracker = () => {
  const currentApp = useCurrentApp();
  const { pathname, search } = useLocation();
  const setRecents = useSetRecentApps();

  useEffect(() => {
    if (!currentApp) return;

    const entry: RecentApp = { id: currentApp.id, lastPath: `${pathname}${search}` };
    setRecents((recents) => [entry, ...recents.filter((recent) => recent.id !== entry.id)]);
  }, [currentApp, pathname, search, setRecents]);
};

export const useRecentApps = () => {
  const recents = useRecentAppsValue();
  const setRecents = useSetRecentApps();
  const [isOpen, setOpen] = useRecentsOpen();
  const history = useHistory();
  const currentApp = useCurrentApp();

  const closeApp = useCallback(
    (id: string) => {
      setRecents((list) => list.filter((recent) => recent.id !== id));
      if (currentApp?.id === id) history.push('/');
    },
    [setRecents, currentApp, history],
  );

  const reopenApp = useCallback(
    (recent: RecentApp) => {
      setOpen(false);
      history.push(recent.lastPath);
    },
    [setOpen, history],
  );

  const clearAll = useCallback(() => {
    setRecents([]);
    setOpen(false);
    if (currentApp) history.push('/');
  }, [setRecents, setOpen, currentApp, history]);

  const goHome = useCallback(() => {
    setOpen(false);
    if (currentApp) closeApp(currentApp.id);
    else history.push('/');
  }, [setOpen, currentApp, closeApp, history]);

  return { recents, isOpen, setOpen, closeApp, reopenApp, clearAll, goHome };
};

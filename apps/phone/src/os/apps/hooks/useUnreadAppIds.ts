import { useMemo } from 'react';
import { useUnreadNotifications } from '@os/new-notifications/state';
import { IApp } from '../config/apps';

export const useUnreadAppIds = (apps: IApp[]): ReadonlySet<string> => {
  const unread = useUnreadNotifications() as { appId: string }[];

  return useMemo(() => {
    const ids = new Set(unread.map((notification) => notification.appId));
    apps.forEach((app) => {
      if (app.notification?.badge > 0) ids.add(app.id);
    });
    return ids;
  }, [unread, apps]);
};

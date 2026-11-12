import { selector, useRecoilValue } from 'recoil';
import { NPWDNotification } from '@typings/notifications';
import { notifications, unreadNotificationIds } from './state';

export interface NotificationGroup {
  appId: string;
  latest: NPWDNotification;
  items: NPWDNotification[];
}

const unreadNotificationList = selector<NPWDNotification[]>({
  key: 'cobalt:unreadNotificationList',
  get: ({ get }) =>
    Array.from(new Set(get(unreadNotificationIds)))
      .map((id) => get(notifications(id)))
      .filter((notification) => notification.appId),
});

export const groupNotifications = (list: NPWDNotification[]): NotificationGroup[] => {
  const byApp = new Map<string, NPWDNotification[]>();

  [...list]
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .forEach((notification) => {
      byApp.set(notification.appId, [...(byApp.get(notification.appId) ?? []), notification]);
    });

  return Array.from(byApp, ([appId, items]) => ({ appId, latest: items[0], items }));
};

const unreadNotificationGroups = selector<NotificationGroup[]>({
  key: 'cobalt:unreadNotificationGroups',
  get: ({ get }) => groupNotifications(get(unreadNotificationList)),
});

export const useUnreadNotificationGroups = () => useRecoilValue(unreadNotificationGroups);

export const notificationAge = (createdAt: number | undefined, now: number, nowLabel: string) => {
  if (!createdAt) return nowLabel;

  const minutes = Math.floor((now - createdAt) / 60_000);
  if (minutes < 1) return nowLabel;
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  return `${Math.floor(hours / 24)}d`;
};

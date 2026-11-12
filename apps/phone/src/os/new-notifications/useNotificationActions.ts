import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { NPWDNotification } from '@typings/notifications';
import { NotificationGroup } from './groups';
import { useNotification } from './useNotification';

export const useNotificationActions = () => {
  const history = useHistory();
  const { markAsRead, markAllAsRead } = useNotification();

  const markGroupRead = useCallback(
    async (group: NotificationGroup) => {
      for (const notification of group.items) {
        await markAsRead(notification.id);
      }
    },
    [markAsRead],
  );

  const openNotification = useCallback(
    (notification: NPWDNotification, group: NotificationGroup) => {
      if (notification.onClick) notification.onClick();
      else if (notification.path) history.push(notification.path);
      markGroupRead(group);
    },
    [history, markGroupRead],
  );

  return { openNotification, markGroupRead, markAllAsRead };
};

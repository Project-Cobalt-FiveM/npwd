import { CreateNotificationDTO, NotificationEvents } from '@typings/notifications';
import InjectDebugData from './InjectDebugData';

const mockNotification = (
  appId: string,
  notisId: string,
  secondaryTitle: string,
  content: string,
  path: string,
): CreateNotificationDTO => ({
  appId,
  notisId,
  secondaryTitle,
  content,
  path,
  duration: 3000,
  keepOpen: false,
  onClick: null,
});

InjectDebugData<CreateNotificationDTO>(
  [
    {
      app: 'PHONE',
      method: NotificationEvents.CREATE_NOTIFICATION,
      data: mockNotification(
        'MESSAGES',
        'debug:messages:1',
        'Jade Okafor',
        'Meet at the Vespucci pier at 9?',
        '/messages',
      ),
    },
    {
      app: 'PHONE',
      method: NotificationEvents.CREATE_NOTIFICATION,
      data: mockNotification(
        'MESSAGES',
        'debug:messages:2',
        'Marcus Reyes',
        "You still at Legion Square? I'm parked by the fountain",
        '/messages',
      ),
    },
    {
      app: 'PHONE',
      method: NotificationEvents.CREATE_NOTIFICATION,
      data: mockNotification(
        'TWITTER',
        'debug:twitter:1',
        '@vinewoodvic mentioned you',
        'Sunset at Vespucci with @you, best crew in Los Santos',
        '/twitter',
      ),
    },
  ],
  4000,
);

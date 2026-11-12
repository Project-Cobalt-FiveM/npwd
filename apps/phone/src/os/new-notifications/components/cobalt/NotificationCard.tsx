import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import { useApp } from '@os/apps/hooks/useApps';
import { AppTile } from '@ui/cobalt';
import { cn } from '@utils/css';
import { NPWDNotification } from '@typings/notifications';
import { NotificationGroup, notificationAge } from '../../groups';

const replyableApps: ReadonlySet<string> = new Set(['MESSAGES', 'DARKCHAT']);

const contentText = (notification: NPWDNotification) =>
  typeof notification.content === 'string' ? notification.content : notification.content?.textContent ?? '';

interface NotificationCardProps {
  group: NotificationGroup;
  onOpen: (notification: NPWDNotification) => void;
  onMarkRead: (group: NotificationGroup) => void;
  className?: string;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  group,
  onOpen,
  onMarkRead,
  className,
}) => {
  const [t] = useTranslation();
  const app = useApp(group.appId);
  const [expanded, setExpanded] = useState(false);

  if (!app) return null;

  const { latest, items } = group;
  const appName: string = t(app.nameLocale);
  const age = notificationAge(latest.createdAt, Date.now(), t('COBALT.NOW'));
  const extra = items.slice(1);
  const canReply = replyableApps.has(group.appId) && Boolean(latest.path || latest.onClick);
  const toggleLabel: string = expanded ? t('COBALT.COLLAPSE') : t('COBALT.EXPAND');
  const ToggleIcon = expanded ? CaretUp : CaretDown;
  const replyLabel: string = t('COBALT.REPLY');
  const markReadLabel: string = t('COBALT.MARK_AS_READ');

  const stop = (handler: () => void) => (event: React.MouseEvent) => {
    event.stopPropagation();
    handler();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(latest)}
      onKeyDown={(event) => event.key === 'Enter' && onOpen(latest)}
      className={cn(
        'flex w-full cursor-pointer gap-3 rounded-3xl bg-cb-muted px-4 pb-3 pt-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary',
        className,
      )}
    >
      <AppTile app={app} size={32} shape="circle" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-5 shrink-0 items-center justify-between">
          <span className="truncate text-xs text-cb-muted-foreground">
            {appName} · {age}
          </span>
          <button
            type="button"
            aria-label={toggleLabel}
            aria-expanded={expanded}
            onClick={stop(() => setExpanded((value) => !value))}
            className="flex h-5 items-center gap-0.5 rounded-full bg-cb-secondary pl-2 pr-1.5 text-cb-muted-foreground hover:text-cb-foreground"
          >
            {items.length > 1 && (
              <span className="text-xs font-medium text-cb-foreground tabular-nums">{items.length}</span>
            )}
            <ToggleIcon size={14} weight="fill" />
          </button>
        </div>
        <p className="truncate text-sm font-semibold text-cb-foreground">
          {latest.secondaryTitle || appName}
        </p>
        <p className={cn('text-sm text-cb-muted-foreground', !expanded && 'line-clamp-1')}>
          {contentText(latest)}
        </p>
        {extra.length > 0 && (
          <div className="flex flex-col gap-0.5 pt-1.5">
            {(expanded ? extra : extra.slice(0, 1)).map((notification) => (
              <p
                key={notification.id}
                className={cn('text-sm text-cb-muted-foreground', !expanded && 'line-clamp-1')}
              >
                {notification.secondaryTitle && (
                  <span className="font-semibold text-cb-foreground">{notification.secondaryTitle} </span>
                )}
                {contentText(notification)}
              </p>
            ))}
          </div>
        )}
        {expanded && (
          <div className="-ml-3 flex gap-1 pt-2">
            {canReply && (
              <button
                type="button"
                onClick={stop(() => onOpen(latest))}
                className="flex h-9 items-center rounded-full px-3 text-sm font-semibold text-cb-cobalt-foreground hover:bg-cb-secondary"
              >
                {replyLabel}
              </button>
            )}
            <button
              type="button"
              onClick={stop(() => onMarkRead(group))}
              className="flex h-9 items-center rounded-full px-3 text-sm font-semibold text-cb-cobalt-foreground hover:bg-cb-secondary"
            >
              {markReadLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

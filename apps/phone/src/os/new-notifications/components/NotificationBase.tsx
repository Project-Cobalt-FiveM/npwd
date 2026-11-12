import { IApp } from '@os/apps/config/apps';
import { SnackbarContent, CustomContentProps } from 'notistack';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { AppTile } from '@ui/cobalt';
import { useNotification } from '../useNotification';

const replyableApps: ReadonlySet<string> = new Set(['MESSAGES', 'DARKCHAT']);

interface NotificationBaseProps extends CustomContentProps {
  app: IApp;
  secondaryTitle?: string;
  path?: string;
  onClick?: () => void;
}

export type NotificationBaseComponent = React.FC<NotificationBaseProps>;

const actionButton =
  'flex h-9 items-center rounded-full px-3 text-sm font-semibold text-cb-cobalt-foreground transition-colors duration-150 ease-cb hover:bg-cb-secondary';

const NotificationBase = forwardRef<HTMLDivElement, NotificationBaseProps>((props, ref) => {
  const { markAsRead } = useNotification();
  const { app, message, secondaryTitle, path, onClick } = props;
  const [t] = useTranslation();
  const history = useHistory();
  const id = props.id.toString();

  const handleOpen = () => {
    if (onClick) onClick();
    else if (path) history.push(path);
    markAsRead(id);
  };

  const handleMarkRead = (event: React.MouseEvent) => {
    event.stopPropagation();
    markAsRead(id);
  };

  const handleReply = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleOpen();
  };

  if (!app) {
    console.error(`Notification ${id} has no app; start external apps before npwd.`);
    return <div ref={ref} hidden />;
  }

  const appName: string = t(app.nameLocale);
  const canReply = replyableApps.has(app.id) && Boolean(path || onClick);
  const nowLabel: string = t('COBALT.NOW');
  const replyLabel: string = t('COBALT.REPLY');
  const markReadLabel: string = t('COBALT.MARK_AS_READ');

  return (
    <SnackbarContent
      ref={ref}
      role="alert"
      onClick={handleOpen}
      className="flex w-[384px] cursor-pointer gap-3 rounded-3xl bg-cb-muted px-4 pb-2 pt-4 text-cb-foreground shadow-[0_10px_15px_-3px_#000000]"
    >
      <AppTile app={app} size={32} shape="circle" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex h-5 items-center truncate text-xs text-cb-muted-foreground">
          {`${appName} · ${nowLabel}`}
        </span>
        <p className="truncate text-sm font-semibold">{secondaryTitle || appName}</p>
        <p className="line-clamp-1 text-sm text-cb-muted-foreground">{message}</p>
        <div className="-ml-3 flex gap-1 pt-1">
          {canReply && (
            <button type="button" onClick={handleReply} className={actionButton}>
              {replyLabel}
            </button>
          )}
          <button type="button" onClick={handleMarkRead} className={actionButton}>
            {markReadLabel}
          </button>
        </div>
      </div>
    </SnackbarContent>
  );
});

export default NotificationBase;

import { useApps } from '@os/apps/hooks/useApps';
import fetchNui from '@utils/fetchNui';
import { CustomContentProps, SnackbarContent, useSnackbar } from 'notistack';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppTile } from '@ui/cobalt';

interface SystemNotificationBaseProps extends CustomContentProps {
  secondaryTitle?: string;
  controls: boolean;
}

export type SystemNotificationBaseComponent = React.FC<SystemNotificationBaseProps>;

const pillButton =
  'flex h-9 flex-1 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-150 ease-cb';

export const SystemNotificationBase = forwardRef<HTMLDivElement, SystemNotificationBaseProps>(
  (props, ref) => {
    const { secondaryTitle, message, controls } = props;
    const { closeSnackbar } = useSnackbar();
    const { getApp } = useApps();
    const app = getApp('SETTINGS');
    const [t] = useTranslation();

    const handleCloseNoti = () => {
      closeSnackbar(props.id);
    };

    const handleConfirmAction = async () => {
      await fetchNui('npwd:onNotificationConfirm', props.id);
    };

    const handleCancelAction = async () => {
      await fetchNui('npwd:onNotificationCancel', props.id);
    };

    const systemLabel: string = t('APPS_SYSTEM');
    const confirmLabel: string = t('COBALT.CONFIRM');
    const cancelLabel: string = t('GENERIC.CANCEL');

    return (
      <SnackbarContent
        ref={ref}
        role="alert"
        onClick={handleCloseNoti}
        className="flex w-[384px] gap-3 rounded-3xl bg-cb-muted p-4 text-cb-foreground shadow-[0_10px_15px_-3px_#000000]"
      >
        <AppTile app={app} size={32} shape="circle" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="flex h-5 items-center truncate text-xs text-cb-muted-foreground">
            {secondaryTitle ? `${systemLabel} · ${secondaryTitle}` : systemLabel}
          </span>
          <p className="line-clamp-2 text-sm">{message}</p>
          {controls && (
            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={handleCancelAction}
                className={`${pillButton} border border-cb-input bg-cb-secondary hover:bg-cb-input`}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`${pillButton} bg-cb-primary hover:bg-cb-primary-hover`}
              >
                {confirmLabel}
              </button>
            </div>
          )}
        </div>
      </SnackbarContent>
    );
  },
);

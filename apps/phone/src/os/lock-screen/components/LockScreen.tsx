import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, LockSimple, Phone } from '@phosphor-icons/react';
import { useWallpaper } from '../../../apps/settings/hooks/useWallpaper';
import { usePhoneClock } from '@os/phone/hooks/usePhoneClock';
import { useUnreadNotificationGroups } from '@os/new-notifications/groups';
import { useNotificationActions } from '@os/new-notifications/useNotificationActions';
import { NotificationCard } from '@os/new-notifications/components/cobalt/NotificationCard';
import { usePresence } from '@ui/cobalt';
import { cn } from '@utils/css';
import { useLockScreenValue, useSetLockScreen } from '../state';

const unlockDistance = 80;
const maxCards = 3;

interface DragState {
  startY: number;
  moved: boolean;
}

export const LockScreen: React.FC = () => {
  const [t] = useTranslation();
  const history = useHistory();
  const locked = useLockScreenValue();
  const setLocked = useSetLockScreen();
  const { mounted, shown } = usePresence(locked, 200);
  const wallpaper = useWallpaper();
  const { time, shortDate } = usePhoneClock();
  const groups = useUnreadNotificationGroups();
  const { openNotification, markGroupRead, markAllAsRead } = useNotificationActions();
  const [drag, setDrag] = useState<DragState | null>(null);
  const [offsetY, setOffsetY] = useState(0);

  if (!mounted) return null;

  const unlockTo = (path?: string) => {
    setLocked(false);
    setOffsetY(0);
    if (path) history.push(path);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setDrag({ startY: event.clientY, moved: false });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;

    const dy = Math.min(0, event.clientY - drag.startY);
    if (!drag.moved && dy < -8) {
      setDrag({ ...drag, moved: true });
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (drag.moved) setOffsetY(dy);
  };

  const handlePointerUp = () => {
    setDrag(null);
    if (offsetY < -unlockDistance) {
      unlockTo();
      return;
    }
    setOffsetY(0);
  };

  const noNotificationsLabel: string = t('COBALT.NO_NEW_NOTIFICATIONS');
  const clearAllLabel: string = t('COBALT.CLEAR_ALL');
  const translate = shown ? offsetY : -40;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn(
        'absolute inset-0 z-40 flex touch-none select-none flex-col overflow-hidden bg-cb-background bg-cover bg-center px-4 pb-4 pt-6',
        !drag?.moved && 'transition-[transform,opacity] duration-200 ease-cb',
        shown ? 'opacity-100' : 'opacity-0',
      )}
      style={{ backgroundImage: wallpaper, transform: `translateY(${translate}px)` }}
    >
      <div className="flex w-full flex-col items-center gap-1 pb-8 pt-2 text-cb-background">
        <span className="text-[88px] font-medium leading-[96px] tracking-[-0.02em] tabular-nums">{time}</span>
        <span className="text-base font-medium">{shortDate}</span>
      </div>

      {groups.length > 0 ? (
        <div className="flex w-full flex-col items-end gap-2">
          {groups.slice(0, maxCards).map((group) => (
            <NotificationCard
              key={group.appId}
              group={group}
              onOpen={(notification) => {
                unlockTo();
                openNotification(notification, group);
              }}
              onMarkRead={markGroupRead}
            />
          ))}
          <button
            type="button"
            onClick={() => markAllAsRead()}
            className="flex h-9 shrink-0 items-center rounded-full bg-cb-muted px-3 text-sm font-medium text-cb-foreground hover:bg-cb-secondary"
          >
            {clearAllLabel}
          </button>
        </div>
      ) : (
        <p className="w-full text-center text-sm text-cb-secondary">{noNotificationsLabel}</p>
      )}

      <div className="flex w-full flex-1 items-end justify-between px-2">
        <button
          type="button"
          aria-label={t('COBALT.OPEN_PHONE')}
          onClick={() => unlockTo('/phone')}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-cb-muted text-cb-foreground hover:bg-cb-secondary"
        >
          <Phone size={22} weight="fill" />
        </button>
        <button
          type="button"
          aria-label={t('COBALT.UNLOCK')}
          onClick={() => unlockTo()}
          className="flex h-14 w-14 items-center justify-center rounded-full text-cb-background transition-transform duration-150 ease-cb active:scale-95"
        >
          <LockSimple size={28} weight="fill" />
        </button>
        <button
          type="button"
          aria-label={t('COBALT.OPEN_CAMERA')}
          onClick={() => unlockTo('/camera')}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-cb-muted text-cb-foreground hover:bg-cb-secondary"
        >
          <Camera size={22} weight="fill" />
        </button>
      </div>
    </div>
  );
};

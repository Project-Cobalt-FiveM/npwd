import React, { useMemo } from 'react';
import { BatteryFull, CellSignalHigh } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useApps } from '@os/apps/hooks/useApps';
import { usePhoneClock } from '@os/phone/hooks/usePhoneClock';
import { IApp } from '@os/apps/config/apps';
import { useUnreadNotifications } from '../state';

const maxUnreadIcons = 3;

const UnreadGlyph: React.FC<{ app: IApp }> = ({ app }) => {
  if (app.tile?.kind === 'glyph') {
    const Glyph = app.tile.glyph;
    return <Glyph size={14} weight="fill" />;
  }
  if (app.tile?.kind === 'lifeinvader') {
    return <span className="text-[11px] font-extrabold leading-none">L</span>;
  }
  return <span className="flex h-3.5 w-3.5 items-center text-[14px]">{app.notificationIcon}</span>;
};

interface StatusBarProps {
  onToggleShade: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ onToggleShade }) => {
  const [t] = useTranslation();
  const { time } = usePhoneClock();
  const { getApp } = useApps();
  const unread = useUnreadNotifications() as { appId: string }[];

  const unreadApps = useMemo(() => {
    const ids = Array.from(new Set(unread.map((notification) => notification.appId)));
    return ids.map(getApp).filter(Boolean).slice(0, maxUnreadIcons);
  }, [unread, getApp]);

  return (
    <button
      type="button"
      onClick={onToggleShade}
      aria-label={t('COBALT.OPEN_SHADE')}
      className="relative z-[60] flex h-[30px] w-full shrink-0 items-center justify-between bg-cb-background px-4 text-cb-foreground"
    >
      <span className="flex w-16 shrink-0 items-center gap-1.5">
        {unreadApps.map((app) => (
          <UnreadGlyph key={app.id} app={app} />
        ))}
      </span>
      <span className="text-[13px] font-semibold leading-4 tabular-nums">{time}</span>
      <span className="flex w-16 shrink-0 items-center justify-end gap-1.5">
        <CellSignalHigh size={16} weight="fill" />
        <BatteryFull size={18} weight="fill" />
      </span>
    </button>
  );
};

import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Airplane, BellSimple, BellSlash, Flashlight, MoonStars } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { usePhoneClock } from '@os/phone/hooks/usePhoneClock';
import { QuickToggle, useQuickSettings } from '@os/quick-settings/state';
import { EmptyState, usePresence } from '@ui/cobalt';
import { cn } from '@utils/css';
import { useUnreadNotificationGroups } from '../../groups';
import { useNotificationActions } from '../../useNotificationActions';
import { NotificationCard } from './NotificationCard';
import { QuickTile } from './QuickTile';
import { BrightnessSlider } from './BrightnessSlider';

const quickTiles: ReadonlyArray<{ key: QuickToggle; icon: Icon; label: string }> = [
  { key: 'doNotDisturb', icon: MoonStars, label: 'COBALT.DO_NOT_DISTURB' },
  { key: 'airplaneMode', icon: Airplane, label: 'COBALT.AIRPLANE_MODE' },
  { key: 'silent', icon: BellSlash, label: 'COBALT.SILENT' },
  { key: 'flashlight', icon: Flashlight, label: 'COBALT.FLASHLIGHT' },
];

const pillButton =
  'flex h-9 items-center rounded-full bg-cb-secondary px-4 text-sm font-medium transition-colors duration-150 ease-cb hover:bg-cb-input';

interface NotificationShadeProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationShade: React.FC<NotificationShadeProps> = ({ open, onClose }) => {
  const [t] = useTranslation();
  const history = useHistory();
  const { mounted, shown } = usePresence(open, 150);
  const { time, shortDate } = usePhoneClock();
  const [quick, setQuick] = useQuickSettings();
  const groups = useUnreadNotificationGroups();
  const { openNotification, markGroupRead, markAllAsRead } = useNotificationActions();

  if (!mounted) return null;

  const toggle = (key: QuickToggle) =>
    setQuick((current) => ({ ...current, [key]: !current[key] }));

  const handleManage = () => {
    onClose();
    history.push('/settings');
  };

  const manageLabel: string = t('COBALT.MANAGE');
  const clearAllLabel: string = t('COBALT.CLEAR_ALL');

  return (
    <div className="absolute inset-x-0 bottom-0 top-[30px] z-50 flex flex-col">
      <section
        className={cn(
          'flex max-h-full flex-col gap-4 rounded-b-[28px] border-b border-cb-border bg-cb-popover px-4 pb-2.5 pt-3 text-cb-foreground shadow-[0_10px_15px_-3px_#000000] transition-[transform,opacity] ease-cb',
          shown ? 'translate-y-0 opacity-100 duration-200' : '-translate-y-2 opacity-0 duration-150',
        )}
      >
        <div className="flex items-baseline gap-2.5 px-1">
          <span className="text-[32px] font-medium leading-10 tabular-nums">{time}</span>
          <span className="text-sm text-cb-muted-foreground">{shortDate}</span>
        </div>

        <div className="flex w-full flex-wrap gap-2">
          {quickTiles.map(({ key, icon, label }) => (
            <QuickTile
              key={key}
              icon={icon}
              label={t(label)}
              stateLabel={quick[key] ? t('COBALT.ON') : t('COBALT.OFF')}
              on={quick[key]}
              onToggle={() => toggle(key)}
            />
          ))}
        </div>

        <BrightnessSlider
          value={quick.brightness}
          onChange={(brightness) => setQuick((current) => ({ ...current, brightness }))}
        />

        {groups.length === 0 && (
          <EmptyState
            icon={<BellSimple size={22} weight="fill" />}
            title={t('COBALT.SHADE_EMPTY_TITLE')}
            caption={t('COBALT.SHADE_EMPTY_CAPTION')}
            className="pb-3 pt-4"
          />
        )}

        {groups.length > 0 && (
          <div className="flex min-h-0 w-full flex-col gap-2 overflow-y-auto">
            {groups.map((group) => (
              <NotificationCard
                key={group.appId}
                group={group}
                onOpen={(notification) => {
                  onClose();
                  openNotification(notification, group);
                }}
                onMarkRead={markGroupRead}
              />
            ))}
          </div>
        )}

        {groups.length > 0 && (
          <div className="flex w-full justify-between">
            <button type="button" onClick={handleManage} className={pillButton}>
              {manageLabel}
            </button>
            <button type="button" onClick={() => markAllAsRead()} className={pillButton}>
              {clearAllLabel}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label={t('COBALT.CLOSE_SHADE')}
          className="flex w-full shrink-0 justify-center py-1"
        >
          <span className="h-1 w-8 rounded-full bg-cb-input" />
        </button>
      </section>
      <div className="flex-1" onClick={onClose} aria-hidden />
    </div>
  );
};

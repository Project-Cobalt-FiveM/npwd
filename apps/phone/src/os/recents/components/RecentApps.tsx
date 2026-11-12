import React from 'react';
import { useTranslation } from 'react-i18next';
import { Broom, SquaresFour } from '@phosphor-icons/react';
import { useWallpaper } from '../../../apps/settings/hooks/useWallpaper';
import { EmptyState, usePresence } from '@ui/cobalt';
import { cn } from '@utils/css';
import { useRecentApps } from '../useRecentApps';
import { useAllApps } from '../useCurrentApp';
import { useRecentsCarousel } from '../useRecentsCarousel';
import { RecentAppCard } from './RecentAppCard';

export const RecentApps: React.FC = () => {
  const [t] = useTranslation();
  const wallpaper = useWallpaper();
  const allApps = useAllApps();
  const { recents, isOpen, reopenApp, closeApp, clearAll } = useRecentApps();
  const { mounted, shown } = usePresence(isOpen, 150);
  const clearAllLabel: string = t('COBALT.CLEAR_ALL');

  const cards = recents
    .map((recent) => ({ recent, app: allApps.find((app) => app.id === recent.id) }))
    .filter(({ app }) => app);

  const { trackRef, setScaleRef, setCardRef, viewportHandlers } = useRecentsCarousel({
    count: cards.length,
    isOpen: mounted,
    onOpen: (index) => cards[index] && reopenApp(cards[index].recent),
    onDismiss: (index) => cards[index] && closeApp(cards[index].recent.id),
  });

  if (!mounted) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 z-30 flex flex-col items-center gap-5 overflow-hidden bg-cb-muted pb-5 pt-7 transition-[opacity,transform] ease-cb',
        shown ? 'scale-100 opacity-100 duration-200' : 'scale-[0.98] opacity-0 duration-150',
      )}
    >
      <div
        className="pointer-events-none absolute -inset-5 bg-cover bg-center blur-[16px]"
        style={{ backgroundImage: wallpaper }}
        aria-hidden
      />
      {cards.length === 0 ? (
        <div className="relative flex flex-1 items-center">
          <EmptyState
            icon={<SquaresFour size={22} weight="fill" />}
            title={t('COBALT.RECENTS_EMPTY')}
            className="rounded-3xl bg-cb-popover"
          />
        </div>
      ) : (
        <>
          <div
            {...viewportHandlers}
            className="relative h-[500px] w-full shrink-0 cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing"
          >
            <div ref={trackRef} className="flex h-full gap-4 px-[70px] will-change-transform">
              {cards.map(({ recent, app }, index) => (
                <div
                  key={recent.id}
                  ref={setScaleRef(index)}
                  className="h-full w-[260px] shrink-0"
                >
                  <RecentAppCard
                    ref={setCardRef(index)}
                    app={app}
                    index={index}
                    onOpen={() => reopenApp(recent)}
                  />
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="relative flex h-9 shrink-0 items-center gap-2 rounded-full border border-cb-input bg-cb-secondary px-4 text-sm font-medium text-cb-foreground transition-colors duration-150 ease-cb hover:bg-cb-input"
          >
            <Broom size={16} weight="fill" />
            {clearAllLabel}
          </button>
        </>
      )}
    </div>
  );
};

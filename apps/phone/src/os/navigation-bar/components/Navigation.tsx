import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CaretLeft, Circle, SquaresFour } from '@phosphor-icons/react';
import { IconButton } from '@ui/cobalt';
import { useRecentApps } from '@os/recents/useRecentApps';
import { useLockScreenValue } from '@os/lock-screen/state';

export const Navigation: React.FC = () => {
  const history = useHistory();
  const { pathname } = useLocation();
  const [t] = useTranslation();
  const { isOpen: recentsOpen, setOpen: setRecentsOpen, goHome } = useRecentApps();
  const locked = useLockScreenValue();

  const handleBack = () => {
    if (locked) return;
    if (recentsOpen) {
      setRecentsOpen(false);
      return;
    }
    if (pathname !== '/') history.goBack();
  };

  const handleHome = () => {
    if (locked) return;
    goHome();
  };

  const handleRecents = () => {
    if (locked) return;
    setRecentsOpen(!recentsOpen);
  };

  return (
    <nav className="flex h-14 w-full shrink-0 items-center justify-between border-t border-cb-border bg-cb-background px-[46px]">
      <IconButton label={t('COBALT.NAV_BACK')} onClick={handleBack}>
        <CaretLeft size={20} weight="fill" />
      </IconButton>
      <IconButton label={t('COBALT.NAV_HOME')} onClick={handleHome}>
        <Circle size={20} weight="fill" />
      </IconButton>
      <IconButton label={t('COBALT.NAV_RECENTS')} onClick={handleRecents} active={recentsOpen}>
        <SquaresFour size={20} weight="fill" />
      </IconButton>
    </nav>
  );
};

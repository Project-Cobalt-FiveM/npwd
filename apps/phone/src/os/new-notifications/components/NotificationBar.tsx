import React from 'react';
import { useNavbarUncollapsed } from '@os/new-notifications/state';
import { StatusBar } from './StatusBar';
import { NotificationShade } from './cobalt/NotificationShade';

export const NotificationBar = () => {
  const [shadeOpen, setShadeOpen] = useNavbarUncollapsed();

  return (
    <>
      <StatusBar onToggleShade={() => setShadeOpen((open) => !open)} />
      <NotificationShade open={shadeOpen} onClose={() => setShadeOpen(false)} />
    </>
  );
};

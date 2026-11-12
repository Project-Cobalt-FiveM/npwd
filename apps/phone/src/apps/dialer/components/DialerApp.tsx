import React from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { useText } from '@apps/contacts/hooks/useText';
import { Clock, DotsNine, User, Voicemail as VoicemailIcon } from '@phosphor-icons/react';
import { IconTab, IconTabs } from '@ui/cobalt';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { ContactsList } from '../../contacts/components/List/ContactsList';
import { Recents } from './views/Recents';
import { Keypad } from './views/Keypad';
import { Voicemail } from './views/Voicemail';

type DialerTab = '/phone' | '/phone/dial' | '/phone/voicemail' | '/phone/contacts';

const tabPaths: ReadonlyArray<DialerTab> = ['/phone/dial', '/phone/voicemail', '/phone/contacts'];

const currentTab = (pathname: string): DialerTab =>
  tabPaths.find((path) => pathname.startsWith(path)) ?? '/phone';

export const DialerApp: React.FC = () => {
  const t = useText();
  const history = useHistory();
  const { pathname } = useLocation();

  const tabs: ReadonlyArray<IconTab<DialerTab>> = [
    { value: '/phone', label: t('COBALT.DIALER.RECENTS'), icon: Clock },
    { value: '/phone/dial', label: t('COBALT.DIALER.KEYPAD'), icon: DotsNine },
    { value: '/phone/voicemail', label: t('COBALT.DIALER.VOICEMAIL'), icon: VoicemailIcon },
    { value: '/phone/contacts', label: t('COBALT.DIALER.CONTACTS'), icon: User },
  ];

  return (
    <div className="relative flex h-full flex-col bg-cb-background font-sans text-cb-foreground">
      <React.Suspense fallback={<LoadingSpinner />}>
        <Switch>
          <Route path="/phone/dial" component={Keypad} />
          <Route path="/phone/voicemail" component={Voicemail} />
          <Route path="/phone/contacts" component={ContactsList} />
          <Route exact path="/phone" component={Recents} />
        </Switch>
      </React.Suspense>
      <IconTabs tabs={tabs} value={currentTab(pathname)} onChange={(path) => history.replace(path)} />
    </div>
  );
};

import React from 'react';
import { blue, common, grey, purple } from '@mui/material/colors';
import { DialerApp } from '@apps/dialer/components/DialerApp';
import { ContactsApp } from '@apps/contacts/components/ContactsApp';
import { CalculatorApp } from '@apps/calculator/components/CalculatorApp';
import { SettingsApp } from '@apps/settings/components/SettingsApp';
import { MessagesApp } from '@apps/messages/components/MessagesApp';
import { ExampleAppWrapper } from '@apps/example/components/ExampleAppWrapper';
import { MarketplaceApp } from '@apps/marketplace/components/MarketplaceApp';
import { NotesApp } from '@apps/notes/NotesApp';
import CameraApp from '@apps/camera/components/CameraApp';
import { AppRoute } from '../components/AppRoute';

import { MESSAGES_APP_PRIMARY_COLOR, MESSAGES_APP_TEXT_COLOR } from '@apps/messages/messages.theme';
import { CONTACTS_APP_PRIMARY_COLOR, CONTACTS_APP_TEXT_COLOR } from '@apps/contacts/contacts.theme';
import {
  MARKETPLACE_APP_PRIMARY_COLOR,
  MARKETPLACE_APP_ICON_COLOR,
} from '@apps/marketplace/marketplace.theme';
import { NOTES_APP_ICON_COLOR, NOTES_APP_PRIMARY_COLOR } from '@apps/notes/notes.theme';
import { DIALER_APP_PRIMARY_COLOR, DIALER_APP_TEXT_COLOR } from '@apps/dialer/dialer.theme';
import { TWITTER_APP_PRIMARY_COLOR, TWITTER_APP_TEXT_COLOR } from '@apps/twitter/twitter.theme';
import { MATCH_APP_PRIMARY_COLOR, MATCH_APP_TEXT_COLOR } from '@apps/match/match.theme';
import { SvgIconProps, Theme } from '@mui/material';
import { INotificationIcon } from '@os/notifications/providers/NotificationsProvider';
import { BrowserApp } from '@apps/browser/components/BrowserApp';
import { MatchApp } from '@apps/match/components/MatchApp';
import LifeInvaderContainer from '@apps/twitter/components/TwitterContainer';
import { IPhoneSettings } from '@typings/settings';
import { i18n } from 'i18next';
import { DARKCHAT_APP_PRIMARY_COLOR, DARKCHAT_APP_TEXT_COLOR } from '@apps/darkchat/darkchat.theme';
import DarkChatApp from '../../../apps/darkchat/DarkChatApp';
import DialerAppIcon from '../icons/material/app/DIALER';
import BrowserIcon from '../icons/material/app/BROWSER';
import MessagesIcon from '../icons/material/app/MESSAGES';
import DarkchatIcon from '../icons/material/app/DARKCHAT';
import ContactIcon from '../icons/material/app/CONTACTS';
import Calculator from '../icons/material/app/CALCULATOR';
import SettingsIcon from '../icons/material/app/SETTINGS';
import MatchIcon from '../icons/material/app/MATCH';
import TwitterIcon from '../icons/material/app/TWITTER';
import MarketplaceIcon from '../icons/material/app/MARKETPLACE';
import NotesIcon from '../icons/material/app/NOTES';
import Camera from '../icons/material/app/CAMERA';
import ExampleIcon from '../icons/material/app/EXAMPLE';
import {
  AddressBook as AddressBookGlyph,
  Calculator as CalculatorGlyph,
  Camera as CameraGlyph,
  ChatCircleDots as ChatCircleDotsGlyph,
  Code as CodeGlyph,
  GearSix as GearSixGlyph,
  Globe as GlobeGlyph,
  Hash as HashGlyph,
  Heart as HeartGlyph,
  Notepad as NotepadGlyph,
  Phone as PhoneGlyph,
  Storefront as StorefrontGlyph,
  Images as ImagesGlyph,
} from '@phosphor-icons/react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { GalleryApp } from '@apps/gallery/components/GalleryApp';
import GalleryIcon from '../icons/material/app/GALLERY';
import { BankingApp } from '@apps/banking/components/BankingApp';
import BankingIcon from '../icons/material/app/BANKING';
import fleecaIcon from '@apps/banking/assets/contact-icon.png';

export type AppTileArt =
  | { kind: 'glyph'; color: string; glyph: PhosphorIcon }
  | { kind: 'image'; src: string }
  | { kind: 'lifeinvader' };

export interface IAppConfig {
  id: string;
  nameLocale: string;
  backgroundColor: string;
  color: string;
  path: string;
  disable?: boolean;
  Route: React.FC<{ settings?: IPhoneSettings; i18n?: i18n; theme?: Theme }>;
  icon: JSX.Element;
  tile?: AppTileArt;
}

export type IApp = IAppConfig & {
  notification: INotificationIcon;
  icon: JSX.Element;
  isDisabled: boolean;
  notificationIcon: JSX.Element;
  NotificationIcon: React.FC<SvgIconProps>;
  Icon?: React.FC<SvgIconProps>;
  theme?: any;
};

export const APPS: IAppConfig[] = [
  {
    id: 'DIALER',
    tile: { kind: 'glyph', color: '#16A34A', glyph: PhoneGlyph },
    nameLocale: 'APPS_DIALER',
    backgroundColor: DIALER_APP_PRIMARY_COLOR,
    icon: <DialerAppIcon />,
    color: DIALER_APP_TEXT_COLOR,
    path: '/phone',
    Route: () => <AppRoute id="DIALER" path="/phone" component={DialerApp} emitOnOpen={false} />,
  },
  {
    id: 'BROWSER',
    tile: { kind: 'glyph', color: '#0284C7', glyph: GlobeGlyph },
    nameLocale: 'BROWSER.NAME',
    backgroundColor: blue['300'],
    path: '/browser',
    icon: <BrowserIcon />,
    color: common.white,
    Route: () => (
      <AppRoute id="BROWSER" path="/browser" component={BrowserApp} emitOnOpen={false} />
    ),
  },
  {
    id: 'MESSAGES',
    tile: { kind: 'glyph', color: '#0D9488', glyph: ChatCircleDotsGlyph },
    nameLocale: 'APPS_MESSAGES',
    icon: <MessagesIcon />,
    backgroundColor: MESSAGES_APP_PRIMARY_COLOR,
    color: MESSAGES_APP_TEXT_COLOR,
    path: '/messages',
    Route: () => (
      <AppRoute id="MESSAGES" path="/messages" component={MessagesApp} emitOnOpen={false} />
    ),
  },
  {
    id: 'DARKCHAT',
    tile: { kind: 'glyph', color: '#4F46E5', glyph: HashGlyph },
    nameLocale: 'APPS_DARKCHAT',
    icon: <DarkchatIcon />,
    backgroundColor: DARKCHAT_APP_PRIMARY_COLOR,
    color: DARKCHAT_APP_TEXT_COLOR,
    path: '/darkchat',
    Route: () => (
      <AppRoute id="DARKCHAT" path="/darkchat" component={DarkChatApp} emitOnOpen={false} />
    ),
  },
  {
    id: 'CONTACTS',
    tile: { kind: 'glyph', color: '#2563EB', glyph: AddressBookGlyph },
    nameLocale: 'APPS_CONTACTS',
    backgroundColor: CONTACTS_APP_PRIMARY_COLOR,
    icon: <ContactIcon />,
    color: CONTACTS_APP_TEXT_COLOR,
    path: '/contacts',
    Route: () => (
      <AppRoute id="CONTACTS" path="/contacts" component={ContactsApp} emitOnOpen={false} />
    ),
  },
  {
    id: 'CALCULATOR',
    tile: { kind: 'glyph', color: '#9333EA', glyph: CalculatorGlyph },
    nameLocale: 'APPS_CALCULATOR',
    icon: <Calculator />,
    backgroundColor: purple[500],
    color: grey[50],
    path: '/calculator',
    Route: () => (
      <AppRoute id="CALCULATOR" path="/calculator" component={CalculatorApp} emitOnOpen={false} />
    ),
  },
  {
    id: 'SETTINGS',
    tile: { kind: 'glyph', color: '#475569', glyph: GearSixGlyph },
    nameLocale: 'APPS_SETTINGS',
    icon: <SettingsIcon />,
    backgroundColor: '#383838',
    color: grey[50],
    path: '/settings',
    Route: () => (
      <AppRoute id="SETTINGS" path="/settings" component={SettingsApp} emitOnOpen={false} />
    ),
  },
  {
    id: 'MATCH',
    tile: { kind: 'glyph', color: '#DB2777', glyph: HeartGlyph },
    nameLocale: 'APPS_MATCH',
    icon: <MatchIcon />,
    backgroundColor: MATCH_APP_PRIMARY_COLOR,
    color: MATCH_APP_TEXT_COLOR,
    path: '/match',
    Route: () => <AppRoute id="MATCH" path="/match" component={MatchApp} emitOnOpen={false} />,
  },
  {
    id: 'TWITTER',
    tile: { kind: 'lifeinvader' },
    nameLocale: 'APPS_TWITTER',
    icon: <TwitterIcon />,
    backgroundColor: TWITTER_APP_PRIMARY_COLOR,
    color: TWITTER_APP_TEXT_COLOR,
    path: '/twitter',
    Route: () => (
      <AppRoute id="TWITTER" path="/twitter" component={LifeInvaderContainer} emitOnOpen={false} />
    ),
  },
  {
    id: 'MARKETPLACE',
    tile: { kind: 'glyph', color: '#EA580C', glyph: StorefrontGlyph },
    nameLocale: 'APPS_MARKETPLACE',
    icon: <MarketplaceIcon />,
    backgroundColor: MARKETPLACE_APP_PRIMARY_COLOR,
    color: MARKETPLACE_APP_ICON_COLOR,
    path: '/marketplace',
    Route: () => (
      <AppRoute
        id="MARKETPLACE"
        path="/marketplace"
        component={MarketplaceApp}
        emitOnOpen={false}
      />
    ),
  },
  {
    id: 'NOTES',
    tile: { kind: 'glyph', color: '#CA8A04', glyph: NotepadGlyph },
    nameLocale: 'APPS_NOTES',
    icon: <NotesIcon />,
    backgroundColor: NOTES_APP_PRIMARY_COLOR,
    color: NOTES_APP_ICON_COLOR,
    path: '/notes',
    Route: () => <AppRoute id="NOTES" path="/notes" component={NotesApp} emitOnOpen={false} />,
  },
  {
    id: 'CAMERA',
    tile: { kind: 'glyph', color: '#B45309', glyph: CameraGlyph },
    nameLocale: 'APPS_CAMERA',
    icon: <Camera />,
    backgroundColor: grey['A400'],
    color: common.white,
    path: '/camera',
    Route: () => <AppRoute id="CAMERA" path="/camera" component={CameraApp} emitOnOpen={false} />,
  },
  {
    id: 'GALLERY',
    tile: { kind: 'glyph', color: '#0891B2', glyph: ImagesGlyph },
    nameLocale: 'APPS_GALLERY',
    icon: <GalleryIcon />,
    backgroundColor: '#0891B2',
    color: common.white,
    path: '/gallery',
    Route: () => (
      <AppRoute id="GALLERY" path="/gallery" component={GalleryApp} emitOnOpen={false} />
    ),
  },
  {
    id: 'BANKING',
    tile: { kind: 'image', src: fleecaIcon },
    nameLocale: 'APPS_BANKING',
    icon: <BankingIcon />,
    backgroundColor: '#FFFFFF',
    color: common.black,
    path: '/banking',
    Route: () => (
      <AppRoute id="BANKING" path="/banking" component={BankingApp} emitOnOpen={false} />
    ),
  },
];

// Example app only in dev
if (import.meta.env.DEV) {
  APPS.push({
    id: 'EXAMPLE',
    tile: { kind: 'glyph', color: '#475569', glyph: CodeGlyph },
    nameLocale: 'APPS_EXAMPLE',
    icon: <ExampleIcon />,
    backgroundColor: blue[500],
    color: blue[50],
    path: '/example',
    Route: () => (
      <AppRoute id="EXAMPLE" path="/example" component={ExampleAppWrapper} emitOnOpen={false} />
    ),
  });
}

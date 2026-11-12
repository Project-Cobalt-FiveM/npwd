import React, { Suspense, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Check, Copy, Trash } from '@phosphor-icons/react';
import { GalleryPhoto } from '@typings/photo';
import { AppTile, Avatar, BottomSheet } from '@ui/cobalt';
import { useApps } from '@os/apps/hooks/useApps';
import { setClipboard } from '@os/phone/hooks/useClipboard';
import { useRecentContacts } from '../hooks/useRecentContacts';
import { usePhotoTimestamp } from '../hooks/usePeriodLabel';
import {
  lifeInvaderComposeRoute,
  marketplaceComposeRoute,
  messagesComposeRoute,
} from '../utils/shareRoutes';
import { useText } from '../hooks/useText';

interface ShareTarget {
  appId: string;
  route: (image: string) => string;
}

const shareTargets: readonly ShareTarget[] = [
  { appId: 'MESSAGES', route: (image) => messagesComposeRoute(image) },
  { appId: 'TWITTER', route: lifeInvaderComposeRoute },
  { appId: 'MARKETPLACE', route: marketplaceComposeRoute },
];

const displayUrl = (url: string): string => url.replace(/^https?:\/\//, '');

interface ShareSheetProps {
  photos: GalleryPhoto[];
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

interface TargetButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const TargetButton: React.FC<TargetButtonProps> = ({ label, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-[72px] shrink-0 flex-col items-center gap-1.5 rounded-xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary"
  >
    <span className="transition-transform duration-150 ease-cb group-active:scale-95">{icon}</span>
    <span className="w-full truncate text-center text-xs text-cb-foreground">{label}</span>
  </button>
);

const RecentContactsRow: React.FC<{ onSend: (number: string) => void }> = ({ onSend }) => {
  const t = useText();
  const recents = useRecentContacts();
  if (recents.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <p className="px-3 text-xs font-medium text-cb-muted-foreground">
        {t('COBALT.GALLERY.SEND_IN_MESSAGES')}
      </p>
      <div className="flex gap-1 px-1">
        {recents.map((contact) => (
          <TargetButton
            key={contact.number}
            label={contact.name.split(' ')[0]}
            icon={<Avatar name={contact.name} src={contact.avatar} size={52} />}
            onClick={() => onSend(contact.number)}
          />
        ))}
      </div>
    </div>
  );
};

export const ShareSheet: React.FC<ShareSheetProps> = ({ photos, open, onClose, onDelete }) => {
  const t = useText();
  const history = useHistory();
  const { getApp } = useApps();
  const photoTimestamp = usePhotoTimestamp();
  const [copied, setCopied] = useState(false);
  const [first] = photos;
  const single = photos.length === 1 ? first : null;

  useEffect(() => {
    if (open) setCopied(false);
  }, [open]);

  if (!first) return null;

  const handleCopy = () => {
    setClipboard(photos.map((photo) => photo.image).join('\n'));
    setCopied(true);
  };

  const go = (route: string) => {
    onClose();
    history.push(route);
  };

  const apps = shareTargets
    .map((target) => ({ target, app: getApp(target.appId) }))
    .filter(({ app }) => app && !app.isDisabled);

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-[18px] pt-1">
        <div className="flex flex-col gap-3 px-3">
          <h2 className="text-center text-[22px] font-semibold leading-7">
            {t('COBALT.GALLERY.SHARE')}
          </h2>
          <div className="flex items-center gap-3 rounded-2xl bg-cb-muted p-3">
            <img
              src={first.image}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg bg-cb-secondary object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-sm font-medium tabular-nums">
                {single
                  ? photoTimestamp(single.createdAt)
                  : t('COBALT.GALLERY.PHOTO_COUNT', { count: photos.length })}
              </p>
              {single && (
                <p className="truncate text-xs text-cb-muted-foreground">
                  {displayUrl(single.image)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-cb-input bg-cb-secondary px-3 text-[13px] font-medium transition-colors duration-150 ease-cb hover:bg-cb-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary"
            >
              {copied ? <Check size={16} weight="fill" /> : <Copy size={16} weight="fill" />}
              {t(copied ? 'COBALT.GALLERY.LINK_COPIED' : 'COBALT.GALLERY.COPY_LINK', {
                count: photos.length,
              })}
            </button>
          </div>
        </div>

        {single && (
          <>
            <Suspense fallback={null}>
              <RecentContactsRow
                onSend={(number) => go(messagesComposeRoute(single.image, number))}
              />
            </Suspense>
            <div className="flex gap-1 px-1">
              {apps.map(({ target, app }) => (
                <TargetButton
                  key={target.appId}
                  label={t(app.nameLocale)}
                  icon={<AppTile app={app} size={52} shape="circle" />}
                  onClick={() => go(target.route(single.image))}
                />
              ))}
            </div>
          </>
        )}

        <div className="-mx-2 border-t border-cb-border pt-1">
          <button
            type="button"
            onClick={onDelete}
            className="flex h-11 w-full items-center gap-3 px-4 text-sm font-medium text-[#EF4444] transition-colors duration-150 ease-cb hover:bg-cb-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cb-primary"
          >
            <Trash size={20} weight="fill" />
            {t('COBALT.GALLERY.DELETE')}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

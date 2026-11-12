import React, { useState } from 'react';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import { ShareFat, Trash } from '@phosphor-icons/react';
import { AppBar, AppTile } from '@ui/cobalt';
import { cn } from '@utils/css';
import { useApps } from '@os/apps/hooks/useApps';
import { usePhotosValue } from '../hooks/state';
import { useDeletePhotos } from '../hooks/useDeletePhotos';
import { usePhotoTimestamp } from '../hooks/usePeriodLabel';
import { ShareSheet } from './ShareSheet';
import { DeleteSheet } from './DeleteSheet';
import { lifeInvaderComposeRoute } from '../utils/shareRoutes';
import { useText } from '../hooks/useText';

type Sheet = 'share' | 'delete' | null;

interface ViewerActionProps {
  label: string;
  icon: React.ReactNode;
  className?: string;
  onClick: () => void;
}

const ViewerAction: React.FC<ViewerActionProps> = ({ label, icon, className, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'group flex w-[88px] shrink-0 flex-col items-center gap-1.5 rounded-xl text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary',
      className,
    )}
  >
    <span className="flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-150 ease-cb group-hover:bg-cb-muted group-active:bg-cb-input">
      {icon}
    </span>
    <span className="text-center leading-4">{label}</span>
  </button>
);

export const PhotoViewer: React.FC = () => {
  const t = useText();
  const history = useHistory();
  const { photoId } = useParams<{ photoId: string }>();
  const photos = usePhotosValue();
  const photoTimestamp = usePhotoTimestamp();
  const deletePhotos = useDeletePhotos();
  const { getApp } = useApps();
  const [sheet, setSheet] = useState<Sheet>(null);

  const photo = photos.find((entry) => entry.id === Number(photoId));
  if (!photo) return <Redirect to="/gallery" />;

  const lifeInvader = getApp('TWITTER');

  const confirmDelete = async () => {
    const deleted = await deletePhotos([photo]);
    setSheet(null);
    if (deleted) history.replace('/gallery');
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <AppBar
        back
        onBack={() => history.push('/gallery')}
        title={
          <span className="text-base font-semibold tabular-nums">
            {photoTimestamp(photo.createdAt)}
          </span>
        }
        className="h-14"
      />
      <div className="flex min-h-0 flex-1 items-center justify-center bg-cb-background">
        <img src={photo.image} alt="" className="max-h-full max-w-full object-contain" />
      </div>
      <div className="flex shrink-0 items-start justify-around px-2 pb-4 pt-3">
        <ViewerAction
          label={t('COBALT.GALLERY.SHARE')}
          icon={<ShareFat size={22} weight="fill" />}
          className="text-cb-cobalt-foreground"
          onClick={() => setSheet('share')}
        />
        {lifeInvader && !lifeInvader.isDisabled && (
          <ViewerAction
            label={t('COBALT.GALLERY.POST_TO_LIFEINVADER')}
            icon={<AppTile app={lifeInvader} size={28} />}
            className="text-cb-muted-foreground"
            onClick={() => history.push(lifeInvaderComposeRoute(photo.image))}
          />
        )}
        <ViewerAction
          label={t('COBALT.GALLERY.DELETE')}
          icon={<Trash size={22} weight="fill" />}
          className="text-[#EF4444]"
          onClick={() => setSheet('delete')}
        />
      </div>

      <ShareSheet
        photos={[photo]}
        open={sheet === 'share'}
        onClose={() => setSheet(null)}
        onDelete={() => setSheet('delete')}
      />
      <DeleteSheet
        count={1}
        open={sheet === 'delete'}
        onClose={() => setSheet(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

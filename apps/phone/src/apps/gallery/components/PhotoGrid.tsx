import React from 'react';
import { GalleryPhoto } from '@typings/photo';
import { cn } from '@utils/css';
import { PhotoSection } from '../utils/sections';
import { usePeriodLabel } from '../hooks/usePeriodLabel';
import { PhotoTile } from './PhotoTile';
import { useText } from '../hooks/useText';

interface PhotoGridProps {
  sections: PhotoSection[];
  selected: ReadonlySet<number> | null;
  onOpen: (photo: GalleryPhoto) => void;
  onToggle: (photo: GalleryPhoto) => void;
  onLongPress?: (photo: GalleryPhoto) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  sections,
  selected,
  onOpen,
  onToggle,
  onLongPress,
}) => {
  const t = useText();
  const periodLabel = usePeriodLabel();
  const selecting = selected !== null;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pb-2">
      {sections.map((section, index) => {
        const label = periodLabel(section.period);
        return (
          <section key={section.key} aria-label={label}>
            <header
              className={cn(
                'flex items-center justify-between px-4 pb-2',
                index === 0 ? 'pt-2' : 'pt-4',
              )}
            >
              <h2 className="text-sm font-medium text-cb-foreground">{label}</h2>
              <span className="text-xs tabular-nums text-cb-muted-foreground">
                {t('COBALT.GALLERY.PHOTO_COUNT', { count: section.photos.length })}
              </span>
            </header>
            <div className="grid grid-cols-3 gap-[2px]">
              {section.photos.map((photo) => (
                <PhotoTile
                  key={photo.id}
                  photo={photo}
                  label={t(selecting ? 'COBALT.GALLERY.SELECT_PHOTO' : 'COBALT.GALLERY.OPEN_PHOTO')}
                  selecting={selecting}
                  selected={selected?.has(photo.id) ?? false}
                  onOpen={onOpen}
                  onToggle={onToggle}
                  onLongPress={onLongPress}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

import React, { useRef } from 'react';
import { Check } from '@phosphor-icons/react';
import { GalleryPhoto } from '@typings/photo';
import { cn } from '@utils/css';

const longPressMs = 450;

interface PhotoTileProps {
  photo: GalleryPhoto;
  label: string;
  selecting: boolean;
  selected: boolean;
  onOpen: (photo: GalleryPhoto) => void;
  onToggle: (photo: GalleryPhoto) => void;
  onLongPress?: (photo: GalleryPhoto) => void;
}

export const PhotoTile: React.FC<PhotoTileProps> = ({
  photo,
  label,
  selecting,
  selected,
  onOpen,
  onToggle,
  onLongPress,
}) => {
  const timer = useRef<number | null>(null);
  const pressed = useRef(false);

  const cancelPress = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  const handlePointerDown = () => {
    pressed.current = false;
    if (!onLongPress || selecting) return;
    timer.current = window.setTimeout(() => {
      pressed.current = true;
      onLongPress(photo);
    }, longPressMs);
  };

  const handleClick = () => {
    cancelPress();
    if (pressed.current) return;
    if (selecting) onToggle(photo);
    else onOpen(photo);
  };

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selecting ? selected : undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onClick={handleClick}
      onContextMenu={(event) => event.preventDefault()}
      className="relative aspect-square w-full overflow-hidden bg-cb-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cb-primary"
    >
      <img
        src={photo.image}
        alt=""
        loading="lazy"
        draggable={false}
        className={cn(
          'h-full w-full object-cover transition-transform duration-200 ease-cb',
          selected && 'scale-[0.94]',
        )}
      />
      {selecting && (
        <>
          {selected && <span className="absolute inset-0 border-2 border-cb-primary" aria-hidden />}
          <span
            className={cn(
              'absolute right-1.5 top-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-cb-foreground transition-colors duration-150 ease-cb',
              selected ? 'bg-cb-primary' : 'bg-cb-background',
            )}
            aria-hidden
          >
            {selected && <Check size={12} weight="fill" className="text-cb-foreground" />}
          </span>
        </>
      )}
    </button>
  );
};

import React from 'react';
import { Camera, Image, MapPin, Note, User } from '@phosphor-icons/react';
import { BottomSheet } from '@ui/cobalt';
import { useText } from '../../hooks/useText';

export type AttachKind = 'camera' | 'gallery' | 'contact' | 'note' | 'location';

interface AttachTile {
  kind: AttachKind;
  labelKey: string;
  color: string;
  icon: React.ReactNode;
}

const tiles: AttachTile[] = [
  {
    kind: 'camera',
    labelKey: 'COBALT.MESSAGES.ATTACH_CAMERA',
    color: '#B45309',
    icon: <Camera size={24} weight="fill" />,
  },
  {
    kind: 'gallery',
    labelKey: 'COBALT.MESSAGES.ATTACH_GALLERY',
    color: '#0891B2',
    icon: <Image size={24} weight="fill" />,
  },
  {
    kind: 'contact',
    labelKey: 'COBALT.MESSAGES.ATTACH_CONTACT',
    color: '#2563EB',
    icon: <User size={24} weight="fill" />,
  },
  {
    kind: 'note',
    labelKey: 'COBALT.MESSAGES.ATTACH_NOTE',
    color: '#CA8A04',
    icon: <Note size={24} weight="fill" />,
  },
  {
    kind: 'location',
    labelKey: 'COBALT.MESSAGES.ATTACH_LOCATION',
    color: '#16A34A',
    icon: <MapPin size={24} weight="fill" />,
  },
];

interface AttachSheetProps {
  open: boolean;
  onClose: () => void;
  onPick: (kind: AttachKind) => void;
}

export const AttachSheet: React.FC<AttachSheetProps> = ({ open, onClose, onPick }) => {
  const t = useText();

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-5 px-3 pb-3 pt-1">
        <h2 className="text-center text-[22px] font-semibold leading-7 text-cb-foreground">
          {t('COBALT.MESSAGES.ATTACH')}
        </h2>
        <div className="flex gap-2">
          {tiles.map((tile) => (
            <button
              key={tile.kind}
              type="button"
              onClick={() => {
                onClose();
                onPick(tile.kind);
              }}
              className="group flex flex-1 flex-col items-center gap-2 rounded-lg focus-visible:outline-none"
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full text-cb-foreground transition-transform duration-150 ease-cb group-focus-visible:ring-2 group-focus-visible:ring-cb-foreground group-active:scale-95"
                style={{ backgroundColor: tile.color }}
              >
                {tile.icon}
              </span>
              <span className="text-[13px] font-medium leading-4 text-cb-foreground">
                {t(tile.labelKey)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
};

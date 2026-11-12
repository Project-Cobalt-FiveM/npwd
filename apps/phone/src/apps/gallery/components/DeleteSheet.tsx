import React from 'react';
import { BottomSheet } from '@ui/cobalt';
import { useText } from '../hooks/useText';

interface DeleteSheetProps {
  count: number;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteSheet: React.FC<DeleteSheetProps> = ({ count, open, onClose, onConfirm }) => {
  const t = useText();

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-5 px-4 pb-1 pt-1">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">{t('COBALT.GALLERY.DELETE_TITLE', { count })}</h2>
          <p className="text-sm text-cb-muted-foreground">{t('COBALT.GALLERY.DELETE_CAPTION')}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-full bg-cb-secondary px-5 text-sm font-medium transition-colors duration-150 ease-cb hover:bg-cb-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary"
          >
            {t('COBALT.GALLERY.CANCEL')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-full bg-cb-destructive px-5 text-sm font-medium text-cb-foreground transition-colors duration-150 ease-cb hover:bg-[#B91C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-foreground"
          >
            {t('COBALT.GALLERY.DELETE')}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

import React, { useState } from 'react';
import { cn } from '@utils/css';
import { usePresence } from './usePresence';

const closeDistance = 96;

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  title,
  children,
  className,
}) => {
  const { mounted, shown } = usePresence(open, 200);
  const [dragY, setDragY] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);

  if (!mounted) return null;

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setDragStart(event.clientY);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart === null) return;
    setDragY(Math.max(0, event.clientY - dragStart));
  };

  const handlePointerUp = () => {
    if (dragStart === null) return;
    setDragStart(null);
    if (dragY > closeDistance) onClose();
    setDragY(0);
  };

  const dragging = dragStart !== null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <div className="flex-1" onClick={onClose} aria-hidden />
      <section
        role="dialog"
        aria-modal="true"
        className={cn(
          'flex max-h-[85%] flex-col rounded-t-[28px] border-t border-cb-border bg-cb-popover text-cb-foreground shadow-[0_-8px_16px_-8px_#000000]',
          !dragging && 'transition-transform duration-200 ease-cb',
          className,
        )}
        style={{ transform: shown ? `translateY(${dragY}px)` : 'translateY(100%)' }}
      >
        <div
          className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <span className="h-1 w-8 rounded-full bg-cb-input" />
        </div>
        {title && <h2 className="px-6 pb-2 pt-1 text-base font-semibold">{title}</h2>}
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">{children}</div>
      </section>
    </div>
  );
};

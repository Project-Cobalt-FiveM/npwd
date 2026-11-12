import React, { useEffect, useRef } from 'react';
import { cn } from '@utils/css';
import { usePresence } from './usePresence';

export interface SnackbarProps {
  open: boolean;
  message: React.ReactNode;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
  className?: string;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  open,
  message,
  onClose,
  actionLabel,
  onAction,
  duration = 4000,
  className,
}) => {
  const { mounted, shown } = usePresence(open, 150);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open || duration <= 0) return;
    const timer = window.setTimeout(() => closeRef.current(), duration);
    return () => window.clearTimeout(timer);
  }, [open, duration, message]);

  if (!mounted) return null;

  return (
    <div
      role="status"
      className={cn(
        'absolute bottom-4 left-4 right-4 z-50 flex min-h-12 items-center gap-2 rounded-lg bg-cb-secondary py-2 pl-4 pr-2 text-sm text-cb-foreground shadow-[0_6px_12px_-4px_#000000] transition-[opacity,transform] ease-cb',
        shown ? 'translate-y-0 opacity-100 duration-200' : 'translate-y-1 opacity-0 duration-150',
        className,
      )}
    >
      <div className="min-w-0 flex-1 py-1">{message}</div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={() => {
            onAction();
            onClose();
          }}
          className="h-9 shrink-0 rounded-full px-3 font-semibold text-cb-cobalt-foreground transition-colors duration-150 ease-cb hover:bg-cb-input"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

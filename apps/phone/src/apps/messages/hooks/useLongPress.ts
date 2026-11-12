import React, { useCallback, useEffect, useRef } from 'react';

const holdMs = 450;

export interface LongPressHandlers {
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
  onClickCapture: (event: React.MouseEvent) => void;
}

export const useLongPress = (onLongPress: () => void): LongPressHandlers => {
  const timer = useRef<number | null>(null);
  const fired = useRef(false);

  const clear = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => clear, [clear]);

  const fire = useCallback(() => {
    fired.current = true;
    onLongPress();
  }, [onLongPress]);

  return {
    onPointerDown: (event) => {
      if (event.button !== 0) return;
      fired.current = false;
      clear();
      timer.current = window.setTimeout(fire, holdMs);
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onContextMenu: (event) => {
      event.preventDefault();
      clear();
      onLongPress();
    },
    onClickCapture: (event) => {
      if (!fired.current) return;
      fired.current = false;
      event.stopPropagation();
      event.preventDefault();
    },
  };
};

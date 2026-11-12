import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

const CARD_STRIDE = 276;
const UNFOCUSED_SCALE = 0.856;
const AXIS_LOCK_PX = 8;
const VELOCITY_WINDOW_MS = 100;
const MAX_SAMPLES = 12;
const MOMENTUM_PROJECTION_MS = 200;
const RUBBER_BAND = 0.55;
const SPRING_STIFFNESS = 260;
const SPRING_DAMPING = 2 * Math.sqrt(SPRING_STIFFNESS);
const MAX_FRAME_SECONDS = 0.032;
const WHEEL_SETTLE_MS = 140;
const WHEEL_LINE_PX = 40;
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 0.8;
const LEAVE_OFFSET = -520;
const MOTION_MS = 200;
const EASING = 'cubic-bezier(0.2, 0, 0, 1)';

type Axis = 'none' | 'x' | 'y';

interface Sample {
  time: number;
  x: number;
  y: number;
}

interface Gesture {
  pointerId: number;
  startX: number;
  startY: number;
  startPosition: number;
  axis: Axis;
  index: number | null;
  samples: Sample[];
}

interface CarouselOptions {
  count: number;
  isOpen: boolean;
  onOpen: (index: number) => void;
  onDismiss: (index: number) => void;
}

interface Carousel {
  trackRef: React.RefObject<HTMLDivElement>;
  setScaleRef: (index: number) => (element: HTMLDivElement | null) => void;
  setCardRef: (index: number) => (element: HTMLDivElement | null) => void;
  viewportHandlers: {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
    onWheel: (event: React.WheelEvent<HTMLDivElement>) => void;
  };
}

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const rubberBand = (position: number, max: number, dimension: number): number => {
  const overshoot = position < 0 ? -position : position > max ? position - max : 0;
  if (overshoot === 0) return position;
  const damped = (1 - 1 / ((overshoot * RUBBER_BAND) / dimension + 1)) * dimension;
  return position < 0 ? -damped : max + damped;
};

const velocityOf = (samples: Sample[]): { x: number; y: number } => {
  const last = samples[samples.length - 1];
  const first = samples.find((sample) => last.time - sample.time <= VELOCITY_WINDOW_MS) ?? last;
  const elapsed = last.time - first.time;
  if (elapsed <= 0) return { x: 0, y: 0 };
  return { x: (last.x - first.x) / elapsed, y: (last.y - first.y) / elapsed };
};

const cardIndexOf = (target: EventTarget): number | null => {
  const card = target instanceof Element ? target.closest<HTMLElement>('[data-card-index]') : null;
  return card ? Number(card.dataset.cardIndex) : null;
};

export const useRecentsCarousel = ({ count, isOpen, onOpen, onDismiss }: CarouselOptions): Carousel => {
  const trackRef = useRef<HTMLDivElement>(null);
  const scales = useRef<(HTMLDivElement | null)[]>([]);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const position = useRef(0);
  const frame = useRef<number | null>(null);
  const wheelTimer = useRef<number | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const maxPosition = Math.max(0, (count - 1) * CARD_STRIDE);
  const maxRef = useRef(maxPosition);
  maxRef.current = maxPosition;

  const render = useCallback((value: number) => {
    position.current = value;
    if (trackRef.current) trackRef.current.style.transform = `translate3d(${-value}px, 0, 0)`;
    scales.current.forEach((element, index) => {
      if (!element) return;
      const distance = Math.min(1, Math.abs(index * CARD_STRIDE - value) / CARD_STRIDE);
      element.style.transform = `scale(${1 - (1 - UNFOCUSED_SCALE) * distance})`;
    });
  }, []);

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    if (wheelTimer.current !== null) window.clearTimeout(wheelTimer.current);
    frame.current = null;
    wheelTimer.current = null;
  }, []);

  const settleTo = useCallback(
    (index: number, initialVelocity = 0) => {
      stop();
      const target = clamp(Math.round(index), 0, Math.max(0, count - 1)) * CARD_STRIDE;
      if (prefersReducedMotion()) {
        render(target);
        return;
      }

      let velocity = initialVelocity;
      let last = performance.now();
      const step = (now: number) => {
        const seconds = Math.min(MAX_FRAME_SECONDS, (now - last) / 1000);
        last = now;
        const offset = position.current - target;
        velocity += (-SPRING_STIFFNESS * offset - SPRING_DAMPING * velocity) * seconds;
        const next = position.current + velocity * seconds;
        if (Math.abs(next - target) < 0.5 && Math.abs(velocity) < 10) {
          render(target);
          frame.current = null;
          return;
        }
        render(next);
        frame.current = requestAnimationFrame(step);
      };
      frame.current = requestAnimationFrame(step);
    },
    [count, render, stop],
  );

  useLayoutEffect(() => {
    if (!isOpen) return;
    stop();
    render(0);
  }, [isOpen, render, stop]);

  useLayoutEffect(() => {
    const idle = gesture.current === null && frame.current === null;
    if (idle && position.current > maxPosition) settleTo(maxPosition / CARD_STRIDE);
    else render(position.current);
  });

  useEffect(() => stop, [stop]);

  const moveCard = (index: number, offsetY: number, animate: boolean, opacity = 1) => {
    const card = cards.current[index];
    if (!card) return;
    card.style.transition = animate
      ? `transform ${MOTION_MS}ms ${EASING}, opacity ${MOTION_MS}ms ${EASING}`
      : 'none';
    card.style.transform = `translate3d(0, ${offsetY}px, 0)`;
    card.style.opacity = String(opacity);
  };

  const dismiss = (index: number) => {
    if (prefersReducedMotion()) {
      onDismiss(index);
      return;
    }
    moveCard(index, LEAVE_OFFSET, true, 0);
    window.setTimeout(() => onDismiss(index), MOTION_MS);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    stop();
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: position.current,
      axis: 'none',
      index: cardIndexOf(event.target),
      samples: [{ time: event.timeStamp, x: event.clientX, y: event.clientY }],
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = gesture.current;
    if (!state || state.pointerId !== event.pointerId) return;

    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    state.samples.push({ time: event.timeStamp, x: event.clientX, y: event.clientY });
    if (state.samples.length > MAX_SAMPLES) state.samples.shift();

    if (state.axis === 'none') {
      if (Math.max(Math.abs(dx), Math.abs(dy)) <= AXIS_LOCK_PX) return;
      state.axis = Math.abs(dy) > Math.abs(dx) && state.index !== null ? 'y' : 'x';
    }

    if (state.axis === 'x') {
      const width = event.currentTarget.clientWidth || CARD_STRIDE;
      render(rubberBand(state.startPosition - dx, maxRef.current, width));
    } else if (state.index !== null) {
      moveCard(state.index, Math.min(0, dy), false);
    }
  };

  const finish = (event: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const state = gesture.current;
    if (!state || state.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const velocity = velocityOf(state.samples);

    if (state.axis === 'none') {
      settleTo(position.current / CARD_STRIDE);
      if (!cancelled && state.index !== null) onOpen(state.index);
      return;
    }

    if (state.axis === 'x') {
      const projected = position.current - velocity.x * MOMENTUM_PROJECTION_MS;
      settleTo(projected / CARD_STRIDE, -velocity.x * 1000);
      return;
    }

    if (state.index === null) return;
    const dy = event.clientY - state.startY;
    if (!cancelled && (dy < -DISMISS_DISTANCE || velocity.y < -DISMISS_VELOCITY)) {
      dismiss(state.index);
      return;
    }
    moveCard(state.index, 0, !prefersReducedMotion());
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (delta === 0 || gesture.current) return;
    stop();
    const pixels = event.deltaMode === 1 ? delta * WHEEL_LINE_PX : delta;
    render(clamp(position.current + pixels, 0, maxRef.current));
    wheelTimer.current = window.setTimeout(
      () => settleTo(position.current / CARD_STRIDE),
      WHEEL_SETTLE_MS,
    );
  };

  const setScaleRef = useCallback(
    (index: number) => (element: HTMLDivElement | null) => {
      scales.current[index] = element;
    },
    [],
  );

  const setCardRef = useCallback(
    (index: number) => (element: HTMLDivElement | null) => {
      cards.current[index] = element;
    },
    [],
  );

  return {
    trackRef,
    setScaleRef,
    setCardRef,
    viewportHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event) => finish(event, false),
      onPointerCancel: (event) => finish(event, true),
      onWheel,
    },
  };
};

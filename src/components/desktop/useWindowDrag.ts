import { useRef, useCallback, useEffect } from 'react';
import { applyDrag, type Dir, type Rect, type Limits } from './geometry';

export interface UseWindowDragOptions {
  rect: Rect;
  limits: Limits;
  onRectChange: (rect: Rect) => void;
  windowRef: React.RefObject<HTMLElement | null>;
  stageRef: React.RefObject<HTMLElement | null>;
}

export function useWindowDrag({
  rect,
  limits,
  onRectChange,
  windowRef,
  stageRef,
}: UseWindowDragOptions) {
  const activeDragRef = useRef<{
    pointerId: number;
    dir: Dir;
    startX: number;
    startY: number;
    startRect: Rect;
    currentRect: Rect;
    targetEl: HTMLElement;
    rafId: number | null;
  } | null>(null);

  // Keep latest rect & limits in refs to avoid stale closures in callbacks
  const latestRectRef = useRef(rect);
  latestRectRef.current = rect;

  const latestLimitsRef = useRef(limits);
  latestLimitsRef.current = limits;

  const latestOnChangeRef = useRef(onRectChange);
  latestOnChangeRef.current = onRectChange;

  const startDrag = useCallback(
    (dir: Dir, e: React.PointerEvent<HTMLElement>) => {
      // Only primary mouse button or touch/pen
      if (e.button !== 0) return;

      const targetEl = e.currentTarget;
      try {
        targetEl.setPointerCapture(e.pointerId);
      } catch {
        // Fallback if browser pointer capture fails
      }

      e.preventDefault();
      e.stopPropagation();

      const startRect = { ...latestRectRef.current };
      activeDragRef.current = {
        pointerId: e.pointerId,
        dir,
        startX: e.clientX,
        startY: e.clientY,
        startRect,
        currentRect: startRect,
        targetEl,
        rafId: null,
      };

      // Set dragging attribute for iframe shield & cursor styling
      if (stageRef.current) {
        stageRef.current.setAttribute('data-dragging', 'true');
        stageRef.current.setAttribute('data-drag-dir', dir);
      }
      if (windowRef.current) {
        windowRef.current.setAttribute('data-dragging', 'true');
      }
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    },
    [stageRef, windowRef],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const state = activeDragRef.current;
      if (!state || state.pointerId !== e.pointerId) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      const newRect = applyDrag(
        state.startRect,
        state.dir,
        dx,
        dy,
        latestLimitsRef.current,
      );
      state.currentRect = newRect;

      if (state.rafId === null) {
        state.rafId = requestAnimationFrame(() => {
          if (!activeDragRef.current || !windowRef.current) return;
          const r = activeDragRef.current.currentRect;
          const el = windowRef.current;
          el.style.transform = `translate3d(${r.left}px, ${r.top}px, 0)`;
          el.style.width = `${r.right - r.left}px`;
          el.style.height = `${r.bottom - r.top}px`;
          activeDragRef.current.rafId = null;
        });
      }
    },
    [windowRef],
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const state = activeDragRef.current;
      if (!state || state.pointerId !== e.pointerId) return;

      if (state.rafId !== null) {
        cancelAnimationFrame(state.rafId);
      }

      try {
        state.targetEl.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      const finalRect = state.currentRect;
      activeDragRef.current = null;

      if (stageRef.current) {
        stageRef.current.removeAttribute('data-dragging');
        stageRef.current.removeAttribute('data-drag-dir');
      }
      if (windowRef.current) {
        windowRef.current.removeAttribute('data-dragging');
      }
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';

      latestOnChangeRef.current(finalRect);
    },
    [stageRef, windowRef],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (activeDragRef.current?.rafId) {
        cancelAnimationFrame(activeDragRef.current.rafId);
      }
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, []);

  return {
    startDrag,
    handlePointerMove,
    endDrag,
  };
}

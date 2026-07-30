"use client";

import { useMemo, useRef } from "react";

/**
 * Lets a horizontally-scrollable row be panned by dragging with a mouse,
 * matching the touch-swipe scrolling browsers already provide for free on
 * `overflow-x-auto`. Only intercepts mouse drags — touch/pen pointers are
 * left alone so native touch scrolling (and momentum) keeps working.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startScrollLeft: 0 });

  return useMemo(() => ({
    ref,
    onPointerDown(e: React.PointerEvent) {
      if (e.pointerType !== "mouse") return;
      const el = ref.current;
      if (!el) return;
      drag.current = { active: true, moved: false, startX: e.clientX, startScrollLeft: el.scrollLeft };
    },
    onPointerMove(e: React.PointerEvent) {
      const el = ref.current;
      if (!el || !drag.current.active) return;
      const delta = e.clientX - drag.current.startX;
      if (Math.abs(delta) > 4) drag.current.moved = true;
      el.scrollLeft = drag.current.startScrollLeft - delta;
    },
    onPointerUp() {
      drag.current.active = false;
    },
    onPointerLeave() {
      drag.current.active = false;
    },
    onClickCapture(e: React.MouseEvent) {
      if (drag.current.moved) {
        e.preventDefault();
        e.stopPropagation();
        drag.current.moved = false;
      }
    },
  }), []);
}

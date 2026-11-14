"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";

/**
 * Closes a popover on outside pointer-down or Escape (returning focus to the
 * trigger), and when the page is hidden by Next.js' <Activity> on navigation.
 */
export function useDismiss(
  containerRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, containerRef, triggerRef]);

  // Reset transient open state when this UI is hidden (route preserved by Activity).
  useLayoutEffect(() => () => onClose(), [onClose]);
}

// Small utility hook used by Modal.
// Keeps Tab / Shift+Tab cycling inside `containerRef`.

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  active: boolean,
): void {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const container = containerRef.current;
    const previousActive = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
      );

    // focus the first focusable on mount
    const initial = focusables()[0] ?? container;
    initial.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const elems = focusables();
      if (elems.length === 0) {
        e.preventDefault();
        return;
      }
      const first = elems[0];
      const last = elems[elems.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      previousActive?.focus?.();
    };
  }, [active, containerRef]);
}

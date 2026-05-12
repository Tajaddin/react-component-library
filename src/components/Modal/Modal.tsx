import { useEffect, useId, useRef, type ReactNode } from "react";
import { useFocusTrap } from "../../lib/useFocusTrap";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Defaults to true — Escape closes the modal. */
  closeOnEscape?: boolean;
  /** Defaults to true — clicking outside closes the modal. */
  closeOnOverlayClick?: boolean;
  children: ReactNode;
  /** Optional extra footer slot. */
  footer?: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  children,
  footer,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEscape, onClose]);

  useFocusTrap(ref, open);

  if (!open) return null;
  return (
    <div
      className="rc-modal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="rc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <h2 id={titleId}>{title}</h2>
        <div>{children}</div>
        {footer ? <div style={{ marginTop: "1rem" }}>{footer}</div> : null}
      </div>
    </div>
  );
}

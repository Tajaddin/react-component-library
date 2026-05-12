import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ToastKind = "info" | "success" | "error";

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  show: (msg: string, kind?: ToastKind, ttlMs?: number) => string;
  dismiss: (id: string) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

export interface ToastProviderProps {
  children: ReactNode;
  defaultTtlMs?: number;
}

export function ToastProvider({ children, defaultTtlMs = 3000 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, kind: ToastKind = "info", ttlMs: number = defaultTtlMs) => {
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, kind, message }]);
      if (ttlMs > 0) {
        setTimeout(() => dismiss(id), ttlMs);
      }
      return id;
    },
    [defaultTtlMs, dismiss],
  );

  const api = useMemo(() => ({ show, dismiss, toasts }), [show, dismiss, toasts]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="rc-toast-region" role="status" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`rc-toast rc-toast-${t.kind}`} role="alert">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

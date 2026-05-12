import { useEffect, useId, useRef, useState } from "react";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  buttonClassName?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select…",
  label,
  buttonClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState<number>(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnId = useId();
  const listId = `${btnId}-list`;

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function commit(idx: number) {
    const opt = options[idx];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHi(0);
        return;
      }
      setHi((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      if (open) {
        e.preventDefault();
        commit(hi);
      } else {
        setOpen(true);
        setHi(0);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? placeholder;

  return (
    <div ref={rootRef} className="rc-dropdown">
      {label ? <label htmlFor={btnId} style={{ display: "block", marginBottom: "0.25rem" }}>{label}</label> : null}
      <button
        type="button"
        id={btnId}
        className={`rc-dropdown-trigger ${buttonClassName ?? ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKey}
      >
        {selectedLabel}
      </button>
      {open ? (
        <ul
          id={listId}
          className="rc-dropdown-menu"
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={hi >= 0 ? `${listId}-${hi}` : undefined}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={o.value === value || i === hi}
              aria-disabled={o.disabled || undefined}
              onMouseEnter={() => setHi(i)}
              onClick={() => commit(i)}
              style={{ opacity: o.disabled ? 0.5 : 1 }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

import { useId, useState, type ReactNode } from "react";

export interface TabDef {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabDef[];
  defaultActiveId?: string;
  activeId?: string;
  onChange?: (id: string) => void;
  ariaLabel?: string;
}

export function Tabs({
  tabs,
  defaultActiveId,
  activeId,
  onChange,
  ariaLabel = "Tabs",
}: TabsProps) {
  const baseId = useId();
  const isControlled = activeId !== undefined;
  const [internal, setInternal] = useState<string>(
    defaultActiveId ?? tabs[0]?.id ?? "",
  );
  const active = isControlled ? activeId : internal;

  function activate(id: string) {
    if (!isControlled) setInternal(id);
    onChange?.(id);
  }

  function onTabKey(e: React.KeyboardEvent, idx: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const n = tabs.length;
      let next = (idx + dir + n) % n;
      // skip disabled
      let safety = 0;
      while (tabs[next]?.disabled && safety < n) {
        next = (next + dir + n) % n;
        safety++;
      }
      const id = tabs[next]?.id;
      if (id) {
        activate(id);
        document.getElementById(`${baseId}-tab-${id}`)?.focus();
      }
    }
  }

  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div className="rc-tabs">
      <div role="tablist" className="rc-tabs-list" aria-label={ariaLabel}>
        {tabs.map((t, idx) => (
          <button
            key={t.id}
            id={`${baseId}-tab-${t.id}`}
            role="tab"
            type="button"
            className="rc-tabs-tab"
            aria-selected={t.id === active}
            aria-controls={`${baseId}-panel-${t.id}`}
            aria-disabled={t.disabled || undefined}
            disabled={t.disabled}
            tabIndex={t.id === active ? 0 : -1}
            onClick={() => !t.disabled && activate(t.id)}
            onKeyDown={(e) => onTabKey(e, idx)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {activeTab && (
        <div
          id={`${baseId}-panel-${activeTab.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeTab.id}`}
          className="rc-tabs-panel"
          tabIndex={0}
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}

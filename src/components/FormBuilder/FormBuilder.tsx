import { useId, useState, type ReactNode } from "react";

export type FieldDef<T> =
  | { kind: "text"; name: keyof T; label: string; required?: boolean; placeholder?: string; type?: "text" | "email" | "url" | "tel" }
  | { kind: "textarea"; name: keyof T; label: string; required?: boolean; rows?: number }
  | { kind: "select"; name: keyof T; label: string; required?: boolean; options: Array<{ value: string; label: string }> }
  | { kind: "number"; name: keyof T; label: string; required?: boolean; min?: number; max?: number }
  | { kind: "checkbox"; name: keyof T; label: string }
  ;

export interface FormBuilderProps<T extends Record<string, any>> {
  fields: FieldDef<T>[];
  initial?: Partial<T>;
  /** Synchronous validator. Return a map of field → error string, or null. */
  validate?: (values: T) => Partial<Record<keyof T, string>> | null;
  onSubmit: (values: T) => void | Promise<void>;
  submitLabel?: string;
  footer?: ReactNode;
}

export function FormBuilder<T extends Record<string, any>>({
  fields,
  initial,
  validate,
  onSubmit,
  submitLabel = "Submit",
  footer,
}: FormBuilderProps<T>) {
  const formId = useId();
  const [values, setValues] = useState<T>((initial ?? {}) as T);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function setField(name: keyof T, v: any) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // basic "required" check
    const basicErrors: Partial<Record<keyof T, string>> = {};
    for (const f of fields) {
      const v = values[f.name];
      if ("required" in f && f.required && (v === undefined || v === "" || v === null)) {
        basicErrors[f.name] = "Required";
      }
    }
    let merged = basicErrors;
    if (validate) {
      const extra = validate(values) ?? {};
      merged = { ...basicErrors, ...extra };
    }
    setErrors(merged);
    if (Object.keys(merged).length > 0) return;
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form id={formId} className="rc-form" onSubmit={handleSubmit} noValidate>
      {fields.map((f) => {
        const id = `${formId}-${String(f.name)}`;
        const err = errors[f.name];
        const errId = err ? `${id}-err` : undefined;
        const common = {
          id,
          name: String(f.name),
          "aria-invalid": err ? true : undefined,
          "aria-describedby": errId,
        } as const;
        if (f.kind === "text") {
          return (
            <label key={id} htmlFor={id}>
              {f.label}
              <input
                {...common}
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                required={f.required}
                value={(values[f.name] as string) ?? ""}
                onChange={(e) => setField(f.name, e.target.value)}
              />
              {err && <span className="rc-form-error" id={errId}>{err}</span>}
            </label>
          );
        }
        if (f.kind === "textarea") {
          return (
            <label key={id} htmlFor={id}>
              {f.label}
              <textarea
                {...common}
                rows={f.rows ?? 4}
                required={f.required}
                value={(values[f.name] as string) ?? ""}
                onChange={(e) => setField(f.name, e.target.value)}
              />
              {err && <span className="rc-form-error" id={errId}>{err}</span>}
            </label>
          );
        }
        if (f.kind === "number") {
          return (
            <label key={id} htmlFor={id}>
              {f.label}
              <input
                {...common}
                type="number"
                min={f.min}
                max={f.max}
                required={f.required}
                value={(values[f.name] as number | undefined) ?? ""}
                onChange={(e) => setField(f.name, e.target.value === "" ? undefined : Number(e.target.value))}
              />
              {err && <span className="rc-form-error" id={errId}>{err}</span>}
            </label>
          );
        }
        if (f.kind === "select") {
          return (
            <label key={id} htmlFor={id}>
              {f.label}
              <select
                {...common}
                required={f.required}
                value={(values[f.name] as string) ?? ""}
                onChange={(e) => setField(f.name, e.target.value)}
              >
                <option value="" disabled>Select…</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {err && <span className="rc-form-error" id={errId}>{err}</span>}
            </label>
          );
        }
        if (f.kind === "checkbox") {
          return (
            <label key={id} htmlFor={id} style={{ flexDirection: "row" as any, gap: "0.5rem", display: "flex", alignItems: "center" }}>
              <input
                id={id}
                name={String(f.name)}
                type="checkbox"
                checked={Boolean(values[f.name])}
                onChange={(e) => setField(f.name, e.target.checked)}
              />
              <span>{f.label}</span>
            </label>
          );
        }
        return null;
      })}
      <button type="submit" disabled={submitting}>
        {submitting ? "…" : submitLabel}
      </button>
      {footer}
    </form>
  );
}

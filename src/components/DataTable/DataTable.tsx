import { useMemo, useState, type ReactNode } from "react";

export interface DataTableColumn<T> {
  key: keyof T;
  header: string;
  /** Whether the column supports click-to-sort. Default true. */
  sortable?: boolean;
  /** Cell renderer. Default: `String(row[key])`. */
  render?: (row: T) => ReactNode;
  width?: number | string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  /** Optional initial sort. */
  defaultSort?: { key: keyof T; dir: "asc" | "desc" };
  /** Optional row click handler — used for "open detail" patterns. */
  onRowClick?: (row: T) => void;
  emptyText?: string;
}

type SortState<T> = { key: keyof T; dir: "asc" | "desc" } | null;

function compare<T>(a: T, b: T, key: keyof T): number {
  const av = a[key];
  const bv = b[key];
  if (av === bv) return 0;
  if (av === undefined || av === null) return -1;
  if (bv === undefined || bv === null) return 1;
  // numbers
  if (typeof av === "number" && typeof bv === "number") return av - bv;
  // strings
  return String(av).localeCompare(String(bv));
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  defaultSort,
  onRowClick,
  emptyText = "No data",
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState<T>>(defaultSort ?? null);

  const sorted = useMemo(() => {
    if (!sort) return data;
    const out = [...data];
    out.sort((a, b) => compare(a, b, sort.key) * (sort.dir === "asc" ? 1 : -1));
    return out;
  }, [data, sort]);

  function onHeaderClick(col: DataTableColumn<T>) {
    if (col.sortable === false) return;
    setSort((prev) => {
      if (!prev || prev.key !== col.key) return { key: col.key, dir: "asc" };
      if (prev.dir === "asc") return { key: col.key, dir: "desc" };
      return null;
    });
  }

  return (
    <table className="rc-table" role="grid">
      <thead>
        <tr>
          {columns.map((c) => {
            const aria =
              sort && sort.key === c.key
                ? sort.dir === "asc"
                  ? "ascending"
                  : "descending"
                : "none";
            return (
              <th
                key={String(c.key)}
                onClick={() => onHeaderClick(c)}
                style={{ width: c.width }}
                aria-sort={c.sortable === false ? undefined : (aria as any)}
                scope="col"
                tabIndex={c.sortable === false ? undefined : 0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && c.sortable !== false) {
                    e.preventDefault();
                    onHeaderClick(c);
                  }
                }}
              >
                {c.header}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sorted.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={{ color: "var(--rc-color-muted)" }}>
              {emptyText}
            </td>
          </tr>
        ) : (
          sorted.map((row, i) => (
            <tr
              key={i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{ cursor: onRowClick ? "pointer" : undefined }}
            >
              {columns.map((c) => (
                <td key={String(c.key)}>
                  {c.render ? c.render(row) : String(row[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

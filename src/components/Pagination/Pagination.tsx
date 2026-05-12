export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Max number of page buttons to show around the current page. Default 5. */
  siblingCount?: number;
  ariaLabel?: string;
}

function range(start: number, end: number): number[] {
  if (start > end) return [];
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function paginationItems(
  page: number,
  pageCount: number,
  siblingCount: number,
): Array<number | "ellipsis"> {
  const total = pageCount;
  if (total <= siblingCount + 4) return range(1, total);
  const left = Math.max(2, page - Math.floor(siblingCount / 2));
  const right = Math.min(total - 1, left + siblingCount - 1);
  const items: Array<number | "ellipsis"> = [1];
  if (left > 2) items.push("ellipsis");
  items.push(...range(left, right));
  if (right < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 5,
  ariaLabel = "Pagination",
}: PaginationProps) {
  if (pageCount <= 1) return null;
  const items = paginationItems(page, pageCount, siblingCount);
  return (
    <nav className="rc-pagination" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ‹
      </button>
      {items.map((item, idx) =>
        item === "ellipsis" ? (
          <span key={`e-${idx}`} aria-hidden="true">…</span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            aria-label={`Page ${item}`}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}

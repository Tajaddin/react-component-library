import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "jest-axe";

import { Pagination, paginationItems } from "../src/components/Pagination";

describe("paginationItems", () => {
  it("returns full range for small page counts", () => {
    expect(paginationItems(1, 5, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("inserts ellipsis before & after the window when far from edges", () => {
    const items = paginationItems(20, 50, 5);
    expect(items[0]).toBe(1);
    expect(items[items.length - 1]).toBe(50);
    expect(items).toContain("ellipsis");
  });
});

describe("Pagination", () => {
  it("renders nothing when only 1 page", () => {
    const { container } = render(
      <Pagination page={1} pageCount={1} onPageChange={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("marks current page with aria-current", () => {
    render(<Pagination page={3} pageCount={10} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: /Page 3/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("disables Previous on first page", () => {
    render(<Pagination page={1} pageCount={5} onPageChange={() => {}} />);
    expect(screen.getByLabelText(/Previous page/)).toBeDisabled();
  });

  it("fires onPageChange on click", () => {
    const cb = vi.fn();
    render(<Pagination page={1} pageCount={5} onPageChange={cb} />);
    fireEvent.click(screen.getByRole("button", { name: /Page 3/i }));
    expect(cb).toHaveBeenCalledWith(3);
  });

  it("passes a11y check", async () => {
    const { container } = render(
      <Pagination page={5} pageCount={20} onPageChange={() => {}} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

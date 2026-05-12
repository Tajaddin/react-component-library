import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "jest-axe";

import { Tabs } from "../src/components/Tabs";

const TABS = [
  { id: "a", label: "First", content: <div>panel A</div> },
  { id: "b", label: "Second", content: <div>panel B</div> },
  { id: "c", label: "Disabled", content: <div>panel C</div>, disabled: true },
];

describe("Tabs", () => {
  it("renders the first tab's panel by default", () => {
    render(<Tabs tabs={TABS} />);
    expect(screen.getByText("panel A")).toBeInTheDocument();
  });

  it("switches panel on tab click", () => {
    render(<Tabs tabs={TABS} />);
    fireEvent.click(screen.getByRole("tab", { name: "Second" }));
    expect(screen.getByText("panel B")).toBeInTheDocument();
  });

  it("does not switch to disabled tab", () => {
    render(<Tabs tabs={TABS} />);
    fireEvent.click(screen.getByRole("tab", { name: "Disabled" }));
    expect(screen.getByText("panel A")).toBeInTheDocument();
  });

  it("supports controlled mode", () => {
    const cb = vi.fn();
    render(<Tabs tabs={TABS} activeId="b" onChange={cb} />);
    expect(screen.getByText("panel B")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "First" }));
    expect(cb).toHaveBeenCalledWith("a");
  });

  it("ArrowRight moves focus to next enabled tab", () => {
    render(<Tabs tabs={TABS} />);
    const first = screen.getByRole("tab", { name: "First" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(screen.getByText("panel B")).toBeInTheDocument();
  });

  it("passes a11y check", async () => {
    const { container } = render(<Tabs tabs={TABS} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

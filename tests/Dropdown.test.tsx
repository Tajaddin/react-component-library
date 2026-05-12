import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "jest-axe";

import { Dropdown } from "../src/components/Dropdown";

const OPTIONS = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
  { value: "c", label: "Cherry", disabled: true },
];

describe("Dropdown", () => {
  it("renders placeholder when no value", () => {
    render(<Dropdown options={OPTIONS} onChange={() => {}} placeholder="Pick…" />);
    expect(screen.getByRole("button")).toHaveTextContent("Pick…");
  });

  it("opens the listbox on click", () => {
    render(<Dropdown options={OPTIONS} onChange={() => {}} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("calls onChange with selected value", () => {
    const cb = vi.fn();
    render(<Dropdown options={OPTIONS} onChange={cb} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Banana"));
    expect(cb).toHaveBeenCalledWith("b");
  });

  it("does not select a disabled option", () => {
    const cb = vi.fn();
    render(<Dropdown options={OPTIONS} onChange={cb} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Cherry"));
    expect(cb).not.toHaveBeenCalled();
  });

  it("passes a11y check when closed", async () => {
    const { container } = render(
      <Dropdown options={OPTIONS} onChange={() => {}} label="Fruit" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

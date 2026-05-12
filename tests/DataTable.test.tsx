import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "jest-axe";

import { DataTable } from "../src/components/DataTable";

const rows = [
  { id: 1, name: "Bob", score: 70 },
  { id: 2, name: "Alice", score: 95 },
  { id: 3, name: "Carol", score: 80 },
];

const cols = [
  { key: "id" as const, header: "ID" },
  { key: "name" as const, header: "Name" },
  { key: "score" as const, header: "Score" },
];

describe("DataTable", () => {
  it("renders rows and columns", () => {
    render(<DataTable data={rows} columns={cols} />);
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(rows.length + 1);
  });

  it("sorts when clicking a header", () => {
    render(<DataTable data={rows} columns={cols} />);
    fireEvent.click(screen.getByText("Name"));
    // first body row should be Alice now
    const bodyRows = screen.getAllByRole("row").slice(1);
    expect(bodyRows[0]).toHaveTextContent("Alice");
  });

  it("supports descending toggle on second click", () => {
    render(<DataTable data={rows} columns={cols} />);
    fireEvent.click(screen.getByText("Name")); // asc
    fireEvent.click(screen.getByText("Name")); // desc
    const bodyRows = screen.getAllByRole("row").slice(1);
    expect(bodyRows[0]).toHaveTextContent("Carol");
  });

  it("renders custom cell", () => {
    render(
      <DataTable
        data={rows}
        columns={[
          { key: "id" as const, header: "ID" },
          { key: "name" as const, header: "Name", render: (r) => `~${r.name}~` },
        ]}
      />,
    );
    expect(screen.getByText("~Alice~")).toBeInTheDocument();
  });

  it("calls onRowClick", () => {
    const cb = vi.fn();
    render(<DataTable data={rows} columns={cols} onRowClick={cb} />);
    fireEvent.click(screen.getByText("Bob"));
    expect(cb).toHaveBeenCalledWith(rows[0]);
  });

  it("renders empty text when data is empty", () => {
    render(<DataTable data={[]} columns={cols} emptyText="Nothing" />);
    expect(screen.getByText("Nothing")).toBeInTheDocument();
  });

  it("passes a11y check", async () => {
    const { container } = render(<DataTable data={rows} columns={cols} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

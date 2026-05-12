import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "jest-axe";

import { FormBuilder, type FieldDef } from "../src/components/FormBuilder";

type V = { name: string; age: number; agree: boolean };

const FIELDS: FieldDef<V>[] = [
  { kind: "text", name: "name", label: "Name", required: true },
  { kind: "number", name: "age", label: "Age", required: true, min: 0 },
  { kind: "checkbox", name: "agree", label: "Agree" },
];

describe("FormBuilder", () => {
  it("renders labelled fields", () => {
    render(<FormBuilder fields={FIELDS} onSubmit={() => {}} />);
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
  });

  it("shows 'Required' errors when submitting empty form", async () => {
    const onSubmit = vi.fn();
    render(<FormBuilder fields={FIELDS} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(await screen.findAllByText("Required")).toHaveLength(2);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits when valid", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<FormBuilder fields={FIELDS} onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/Name/i), "Alice");
    await user.type(screen.getByLabelText(/Age/i), "30");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const v = onSubmit.mock.calls[0][0];
    expect(v.name).toBe("Alice");
    expect(v.age).toBe(30);
  });

  it("runs custom validator", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <FormBuilder
        fields={FIELDS}
        validate={(v) => (v.age < 18 ? { age: "must be 18+" } : null)}
        onSubmit={onSubmit}
      />,
    );
    await user.type(screen.getByLabelText(/Name/i), "Bob");
    await user.type(screen.getByLabelText(/Age/i), "10");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(await screen.findByText("must be 18+")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("passes a11y check", async () => {
    const { container } = render(<FormBuilder fields={FIELDS} onSubmit={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

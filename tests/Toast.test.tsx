import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ToastProvider, useToast } from "../src/components/Toast";

function Trigger({ msg, ttl }: { msg: string; ttl?: number }) {
  const t = useToast();
  return <button onClick={() => t.show(msg, "info", ttl)}>fire</button>;
}

describe("Toast", () => {
  it("renders toast messages with role=alert", () => {
    render(
      <ToastProvider>
        <Trigger msg="Hi" ttl={10000} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText("fire"));
    expect(screen.getByRole("alert")).toHaveTextContent("Hi");
  });

  it("removes toast after TTL", async () => {
    render(
      <ToastProvider>
        <Trigger msg="bye" ttl={50} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText("fire"));
    expect(screen.getByRole("alert")).toHaveTextContent("bye");
    await waitFor(
      () => expect(screen.queryByRole("alert")).toBeNull(),
      { timeout: 500 },
    );
  });

  it("throws if useToast used outside provider", () => {
    // Suppress React's error boundary console output
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Trigger msg="x" />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});

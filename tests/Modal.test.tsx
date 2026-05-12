import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "jest-axe";

import { Modal } from "../src/components/Modal";

describe("Modal", () => {
  it("renders title and body when open", () => {
    render(
      <Modal open onClose={() => {}} title="Hello">
        <p>body</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}} title="t">
        <p>nope</p>
      </Modal>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("calls onClose on Escape", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="t">
        <p>x</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose on Escape when closeOnEscape is false", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="t" closeOnEscape={false}>
        <p>x</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose on overlay click", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open onClose={onClose} title="t">
        <p>x</p>
      </Modal>,
    );
    const overlay = container.querySelector(".rc-modal-overlay")!;
    fireEvent.mouseDown(overlay, { target: overlay, currentTarget: overlay });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("passes a11y check", async () => {
    const { container } = render(
      <Modal open onClose={() => {}} title="Accessible">
        <p>body</p>
        <button>focusable</button>
      </Modal>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

import "@/test/setup";
import type { Node } from "@/types/node-edge";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NodeProperties } from "../node-properties";

describe("NodeProperties", () => {
  const mockNode: Node = {
    id: "node-1",
    type: "valve",
    position: { x: 100, y: 100 },
    rotation: 0,
    active: true,
    note: "Test note",
    pressure: 100,
    flowRate: 50,
    status: "open",
    elevation: 0,
    diameter: 100,
  };

  const mockLiveNode: Node = {
    ...mockNode,
    position: { x: 100, y: 100 },
    rotation: 45,
  };

  const defaultProps = {
    node: mockNode,
    liveNode: mockLiveNode,
    onUpdateProperty: vi.fn(),
    onDelete: vi.fn(),
    isSimulation: false,
  };

  it("renders basic node information correctly", () => {
    render(<NodeProperties {...defaultProps} />);

    expect(screen.getByText("Node Property")).toBeInTheDocument();
    expect(screen.getByText("node-1")).toBeInTheDocument();
    expect(screen.getByText("valve")).toBeInTheDocument();
    expect(screen.getByText(/X: 100.00/)).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
  });

  it("handles note textarea change", () => {
    render(<NodeProperties {...defaultProps} />);

    const noteTextarea = screen.getByDisplayValue("Test note");
    fireEvent.change(noteTextarea, { target: { value: "New note" } });

    expect(defaultProps.onUpdateProperty).toHaveBeenCalledWith(
      "note",
      "New note",
    );
  });

  it("shows delete button when not in simulation mode", () => {
    render(<NodeProperties {...defaultProps} />);

    expect(screen.getByText("Delete Node")).toBeInTheDocument();
  });

  it("hides delete button in simulation mode", () => {
    render(<NodeProperties {...defaultProps} isSimulation={true} />);

    expect(screen.queryByText("Delete Node")).not.toBeInTheDocument();
  });

  it("handles node deletion", () => {
    render(<NodeProperties {...defaultProps} />);

    const deleteButton = screen.getByText("Delete Node");
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByText("Delete");
    fireEvent.click(confirmDeleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledWith("node-1");
  });

  it("renders readonly properties in simulation mode", () => {
    render(<NodeProperties {...defaultProps} isSimulation={true} />);

    expect(screen.getByText("Test note")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("renders editable properties in edit mode", () => {
    render(<NodeProperties {...defaultProps} />);

    const noteTextarea = screen.getByDisplayValue("Test note");
    expect(noteTextarea).toBeInTheDocument();
    expect(noteTextarea).toHaveValue("Test note");
  });

  it("renders valve-specific properties", () => {
    render(<NodeProperties {...defaultProps} />);

    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders position with correct formatting", () => {
    render(<NodeProperties {...defaultProps} />);

    const positionText = screen.getByText(/X: 100.00/);
    expect(positionText).toBeInTheDocument();
  });
});

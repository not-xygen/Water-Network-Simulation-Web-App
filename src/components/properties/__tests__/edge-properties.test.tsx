import "@/test/setup";
import type { Edge } from "@/types/node-edge";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EdgeProperties } from "../edge-properties";

describe("EdgeProperties", () => {
  const mockEdge: Edge = {
    id: "edge-1",
    label: "Edge 1",
    sourceId: "node-1",
    targetId: "node-2",
    sourcePosition: "right",
    targetPosition: "left",
    diameter: 100,
    length: 200,
    roughness: 0.1,
    flowRate: 50,
    velocity: 2,
  };

  const mockLiveEdge: Edge = {
    ...mockEdge,
    length: 250,
  };

  const defaultProps = {
    edge: mockEdge,
    liveEdge: mockLiveEdge,
    onUpdateProperty: vi.fn(),
    onDelete: vi.fn(),
    isSimulation: false,
  };

  it("renders basic edge information correctly", () => {
    render(<EdgeProperties {...defaultProps} />);

    expect(screen.getByText("Edge Property")).toBeInTheDocument();
    expect(screen.getByText("edge-1")).toBeInTheDocument();
    expect(screen.getByText("node-1")).toBeInTheDocument();
    expect(screen.getByText("node-2")).toBeInTheDocument();
  });

  it("shows length in edit mode", () => {
    render(<EdgeProperties {...defaultProps} />);

    const lengthText = screen.getByText(/Length/);
    expect(lengthText).toBeInTheDocument();

    const lengthValue = screen.getByText("62.5");
    expect(lengthValue).toBeInTheDocument();
  });

  it("hides length in simulation mode", () => {
    render(<EdgeProperties {...defaultProps} isSimulation={true} />);

    expect(screen.queryByText(/Length/)).not.toBeInTheDocument();
  });

  it("shows delete button when not in simulation mode", () => {
    render(<EdgeProperties {...defaultProps} />);

    expect(screen.getByText("Delete Edge")).toBeInTheDocument();
  });

  it("hides delete button in simulation mode", () => {
    render(<EdgeProperties {...defaultProps} isSimulation={true} />);

    expect(screen.queryByText("Delete Edge")).not.toBeInTheDocument();
  });

  it("handles edge deletion", () => {
    render(<EdgeProperties {...defaultProps} />);

    const deleteButton = screen.getByText("Delete Edge");
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByText("Delete");
    fireEvent.click(confirmDeleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledWith("edge-1");
  });

  it("renders readonly properties in simulation mode", () => {
    render(<EdgeProperties {...defaultProps} isSimulation={true} />);

    expect(screen.getByText("edge-1")).toBeInTheDocument();
    expect(screen.getByText("node-1")).toBeInTheDocument();
    expect(screen.getByText("node-2")).toBeInTheDocument();
  });

  it("renders editable properties in edit mode", () => {
    render(<EdgeProperties {...defaultProps} />);

    expect(screen.getByText("edge-1")).toBeInTheDocument();
    expect(screen.getByText("node-1")).toBeInTheDocument();
    expect(screen.getByText("node-2")).toBeInTheDocument();
  });

  it("displays source and target positions", () => {
    render(<EdgeProperties {...defaultProps} />);

    const sourcePositionInput = screen.getByText("node-1");
    const targetPositionInput = screen.getByText("node-2");

    expect(sourcePositionInput).toBeInTheDocument();
    expect(targetPositionInput).toBeInTheDocument();
  });

  it("displays flow rate and velocity", () => {
    render(<EdgeProperties {...defaultProps} isSimulation={true} />);

    const flowRateInput = screen.getByText("50.0000 L/s");
    const velocityInput = screen.getByText("2.0000 m/s");

    expect(flowRateInput).toBeInTheDocument();
    expect(velocityInput).toBeInTheDocument();
  });
});

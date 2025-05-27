import "@/test/setup";
import type {
  FittingNode,
  Node,
  PumpNode,
  ReservoirNode,
  TankNode,
  ValveNode,
} from "@/types/node-edge";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NodeItem from "../node-item";

describe("NodeItem", () => {
  const mockNode: ReservoirNode = {
    id: "1",
    type: "reservoir",
    position: { x: 0, y: 0 },
    rotation: 0,
    elevation: 0,
    flowRate: 0,
    pressure: 0,
    active: true,
    head: 10,
  };

  const defaultProps = {
    node: mockNode,
    isSelected: false,
    zoom: 100,
    isDragged: false,
    onMouseDown: vi.fn(),
    onMouseUp: vi.fn(),
    onStartConnect: vi.fn(),
    onEndConnect: vi.fn(),
    onRotateStart: vi.fn(),
    onRotateEnd: vi.fn(),
  };

  it("renders correctly", () => {
    render(<NodeItem {...defaultProps} />);
    const nodeElement = screen.getByTestId("node-1");
    expect(nodeElement).toBeInTheDocument();
  });

  it("shows selection ring when selected", () => {
    render(<NodeItem {...defaultProps} isSelected={true} />);
    const nodeElement = screen.getByTestId("node-1");
    const innerElement = nodeElement.querySelector("div > div");
    expect(innerElement).toHaveClass("ring-2", "ring-blue-500");
  });

  it("handles mouse events correctly", () => {
    render(<NodeItem {...defaultProps} />);
    const nodeElement = screen.getByTestId("node-1");

    fireEvent.mouseDown(nodeElement);
    expect(defaultProps.onMouseDown).toHaveBeenCalled();

    fireEvent.mouseUp(nodeElement);
    expect(defaultProps.onMouseUp).toHaveBeenCalled();
  });

  it("renders different node types correctly", () => {
    const nodeTypes = [
      "reservoir",
      "tank",
      "pump",
      "valve",
      "fitting",
    ] as const;

    for (const type of nodeTypes) {
      let node: Node;

      switch (type) {
        case "fitting":
          node = {
            ...mockNode,
            type: "fitting",
            subtype: "tee",
            demand: 0,
            diameter: 100,
          } as FittingNode;
          break;
        case "tank":
          node = {
            ...mockNode,
            type: "tank",
            diameter: 100,
            height: 100,
            maxVolume: 1000,
            currentVolume: 500,
            currentVolumeHeight: 50,
            filledPercentage: 50,
          } as TankNode;
          break;
        case "pump":
          node = {
            ...mockNode,
            type: "pump",
            suctionHeadMax: 10,
            totalHeadMax: 20,
            capacityMax: 100,
            curveHead: [0, 10, 20],
            curveFlow: [0, 50, 100],
            suctionPipeDiameter: 100,
            dischargePipeDiameter: 100,
          } as PumpNode;
          break;
        case "valve":
          node = {
            ...mockNode,
            type: "valve",
            status: "open",
            diameter: 100,
          } as ValveNode;
          break;
        default:
          node = mockNode;
      }

      const { unmount } = render(<NodeItem {...defaultProps} node={node} />);
      const nodeElement = screen.getByTestId(`node-${node.id}`);
      expect(nodeElement).toBeInTheDocument();
      unmount();
    }
  });

  it("applies correct transform based on zoom and rotation", () => {
    const node: Node = {
      ...mockNode,
      rotation: 45,
    };

    render(<NodeItem {...defaultProps} node={node} zoom={150} />);
    const nodeElement = screen.getByTestId("node-1");
    expect(nodeElement).toHaveStyle({
      transform: "scale(1.5) rotate(45deg)",
    });
  });
});

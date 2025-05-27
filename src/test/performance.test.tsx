import type { Node, ReservoirNode } from "@/types/node-edge";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NodeItem from "../components/node/node-item";

describe("Performance Tests", () => {
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
    onMouseDown: () => {},
    onMouseUp: () => {},
    onStartConnect: () => {},
    onEndConnect: () => {},
    onRotateStart: () => {},
    onRotateEnd: () => {},
  };

  it("renders 100 nodes within 1000ms", () => {
    const startTime = performance.now();

    const nodes = Array.from({ length: 100 }, (_, i) => ({
      ...mockNode,
      id: String(i + 1),
    }));

    for (const node of nodes) {
      render(<NodeItem {...defaultProps} node={node} />);
    }

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(1000);
  });

  it("handles rapid state changes efficiently", () => {
    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
      render(<NodeItem {...defaultProps} isSelected={i % 2 === 0} />);
    }

    const endTime = performance.now();
    const updateTime = endTime - startTime;

    expect(updateTime).toBeLessThan(500);
  });

  it("maintains performance with complex node types", () => {
    const startTime = performance.now();

    const complexNode: Node = {
      ...mockNode,
      type: "fitting",
      subtype: "tee",
      demand: 100,
      diameter: 100,
      inletPressure: 10,
      outletPressure: 5,
      minorLossCoefficient: 0.5,
      velocity: 2,
    };

    for (let i = 0; i < 50; i++) {
      render(<NodeItem {...defaultProps} node={complexNode} />);
    }

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(500);
  });
});

import "@/test/setup";
import type { Edge, ReservoirNode } from "@/types/node-edge";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import useNodeEdgeStore from "../node-edge";

describe("useNodeEdgeStore", () => {
  const mockNode: ReservoirNode = {
    id: "node1",
    type: "reservoir",
    position: { x: 0, y: 0 },
    rotation: 0,
    elevation: 0,
    flowRate: 0,
    pressure: 0,
    active: true,
    head: 10,
  };

  const mockEdge: Edge = {
    id: "edge1",
    label: "Edge 1",
    sourceId: "node1",
    targetId: "node2",
    sourcePosition: "right",
    targetPosition: "left",
    length: 100,
    diameter: 50,
    roughness: 0.001,
    flowRate: 0,
    velocity: 0,
  };

  beforeEach(() => {
    act(() => {
      useNodeEdgeStore.setState({
        nodes: [],
        edges: [],
        selectedNodes: [],
        selectedEdges: [],
      });
    });
  });

  it("should initialize with empty arrays", () => {
    const { result } = renderHook(() => useNodeEdgeStore());
    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
    expect(result.current.selectedNodes).toEqual([]);
    expect(result.current.selectedEdges).toEqual([]);
  });

  it("should handle node operations", () => {
    const { result } = renderHook(() => useNodeEdgeStore());

    // Test addNode
    act(() => {
      result.current.addNode(mockNode);
    });
    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0]).toEqual(mockNode);

    // Test updateNodePosition
    act(() => {
      result.current.updateNodePosition("node1", 10, 20);
    });
    expect(result.current.nodes[0].position).toEqual({ x: 10, y: 20 });

    // Test updateNodeRotation
    act(() => {
      result.current.updateNodeRotation("node1", 45);
    });
    expect(result.current.nodes[0].rotation).toBe(45);

    // Test removeNode
    act(() => {
      result.current.removeNode("node1");
    });
    expect(result.current.nodes).toHaveLength(0);
  });

  it("should handle edge operations", () => {
    const { result } = renderHook(() => useNodeEdgeStore());

    // Test addEdge
    act(() => {
      result.current.addEdge(mockEdge);
    });
    expect(result.current.edges).toHaveLength(1);
    expect(result.current.edges[0]).toEqual(mockEdge);

    // Test updateEdgeConnection
    act(() => {
      result.current.updateEdgeConnection("edge1", {
        from: "source",
        newNodeId: "node3",
        newPosition: "top",
      });
    });
    expect(result.current.edges[0].sourceId).toBe("node3");
    expect(result.current.edges[0].sourcePosition).toBe("top");

    // Test removeEdge
    act(() => {
      result.current.removeEdge("edge1");
    });
    expect(result.current.edges).toHaveLength(0);
  });

  it("should handle selection operations", () => {
    const { result } = renderHook(() => useNodeEdgeStore());

    // Test node selection
    act(() => {
      result.current.addNode(mockNode);
      result.current.setSelectedNodes([mockNode]);
    });
    expect(result.current.selectedNodes).toHaveLength(1);
    expect(result.current.selectedNodes[0]).toEqual(mockNode);

    // Test edge selection
    act(() => {
      result.current.addEdge(mockEdge);
      result.current.setSelectedEdges([mockEdge]);
    });
    expect(result.current.selectedEdges).toHaveLength(1);
    expect(result.current.selectedEdges[0]).toEqual(mockEdge);
  });

  it("should handle updates when node position changes", () => {
    const { result } = renderHook(() => useNodeEdgeStore());

    const node1: ReservoirNode = {
      id: "node1",
      type: "reservoir",
      position: { x: 0, y: 0 },
      rotation: 0,
      elevation: 0,
      flowRate: 0,
      pressure: 0,
      active: true,
      head: 10,
    };

    const node2: ReservoirNode = {
      id: "node2",
      type: "reservoir",
      position: { x: 100, y: 0 },
      rotation: 0,
      elevation: 0,
      flowRate: 0,
      pressure: 0,
      active: true,
      head: 10,
    };

    const edge: Edge = {
      id: "edge1",
      label: "Edge 1",
      sourceId: "node1",
      targetId: "node2",
      sourcePosition: "right",
      targetPosition: "left",
      length: 100,
      diameter: 50,
      roughness: 0.001,
      flowRate: 0,
      velocity: 0,
    };

    act(() => {
      result.current.addNode(node1);
      result.current.addNode(node2);
      result.current.addEdge(edge);
    });

    act(() => {
      result.current.updateNodePosition("node1", 50, 0);
    });

    expect(result.current.nodes[0].position.x).toBe(50);
  });
});

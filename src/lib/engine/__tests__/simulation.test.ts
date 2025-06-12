import {
  GRAVITY_PRESSURE,
  PRESSURE_CONVERSION,
  WATER_DENSITY,
} from "@/constant/globals";
import type {
  Edge,
  FittingNode,
  Node,
  PumpNode,
  ReservoirNode,
  TankNode,
  ValveNode,
} from "@/types/node-edge";
import { describe, expect, it } from "vitest";
import { simulateStep } from "../v2";

describe("Simulation Engine", () => {
  const mockReservoir: ReservoirNode = {
    id: "reservoir-1",
    type: "reservoir",
    position: { x: 0, y: 0 },
    rotation: 0,
    elevation: 0,
    flowRate: 0,
    inletPressure: 0,
    outletPressure: 0,
    velocity: 0,
    active: true,
    head: 10,
  };

  const mockTank: TankNode = {
    id: "tank-1",
    type: "tank",
    position: { x: 100, y: 0 },
    rotation: 0,
    elevation: 0,
    flowRate: 0,
    inletPressure: 0,
    outletPressure: 0,
    velocity: 0,
    active: true,
    diameter: 100,
    height: 100,
    maxVolume: 1000,
    currentVolume: 500,
    currentVolumeHeight: 50,
    filledPercentage: 50,
  };

  const mockPump: PumpNode = {
    id: "pump-1",
    type: "pump",
    position: { x: 200, y: 0 },
    rotation: 0,
    elevation: 0,
    flowRate: 0,
    inletPressure: 0,
    outletPressure: 0,
    velocity: 0,
    active: true,
    suctionHeadMax: 7,
    totalHeadMax: 20,
    capacityMax: 100,
    curveHead: [0, 10, 20],
    curveFlow: [0, 50, 100],
    suctionPipeDiameter: 100,
    dischargePipeDiameter: 100,
  };

  const mockFitting: FittingNode = {
    id: "fitting-1",
    type: "fitting",
    position: { x: 300, y: 0 },
    rotation: 0,
    elevation: 0,
    flowRate: 0,
    inletPressure: 0,
    outletPressure: 0,
    velocity: 0,
    active: true,
    subtype: "tee",
    diameter: 100,
  };

  const mockEdge: Edge = {
    id: "edge-1",
    label: "Edge 1",
    sourceId: "reservoir-1",
    targetId: "tank-1",
    sourcePosition: "right",
    targetPosition: "left",
    diameter: 100,
    length: 100,
    roughness: 0.1,
    flowRate: 0,
    velocity: 0,
  };

  const mockReservoir2: ReservoirNode = {
    id: "reservoir-2",
    type: "reservoir",
    position: { x: 0, y: 0 },
    rotation: 0,
    elevation: 0,
    flowRate: 0,
    inletPressure: 0,
    outletPressure: 0,
    velocity: 0,
    active: true,
    head: 10,
  };

  const mockFitting2: FittingNode = {
    id: "fitting-2",
    type: "fitting",
    position: { x: 300, y: 0 },
    rotation: 0,
    elevation: 0,
    flowRate: 0,
    inletPressure: 0,
    outletPressure: 0,
    velocity: 0,
    active: true,
    subtype: "tee",
    diameter: 100,
  };

  describe("Reservoir Node", () => {
    it("should maintain constant pressure based on head", () => {
      const nodes: Node[] = [mockReservoir];
      const edges: Edge[] = [];

      const result = simulateStep(nodes, edges);
      const updatedReservoir = result.nodes[0] as ReservoirNode;

      expect(updatedReservoir.outletPressure).toBe(
        mockReservoir.head *
          WATER_DENSITY *
          GRAVITY_PRESSURE *
          PRESSURE_CONVERSION,
      );
    });
  });

  describe("Tank Node", () => {
    it("should update volume and pressure based on flow", () => {
      const nodes: Node[] = [mockReservoir, mockTank];
      const edges: Edge[] = [mockEdge];

      const result = simulateStep(nodes, edges);
      const updatedTank = result.nodes[1] as TankNode;

      expect(updatedTank.currentVolume).toBeGreaterThanOrEqual(0);
      expect(updatedTank.currentVolume).toBeLessThanOrEqual(
        updatedTank.maxVolume,
      );
      expect(updatedTank.outletPressure).toBeGreaterThanOrEqual(0);
    });

    it("should handle zero diameter tank", () => {
      const zeroDiameterTank: TankNode = {
        ...mockTank,
        diameter: 0,
      };

      const nodes: Node[] = [mockReservoir, zeroDiameterTank];
      const edges: Edge[] = [mockEdge];

      const result = simulateStep(nodes, edges);
      const updatedTank = result.nodes[1] as TankNode;

      expect(updatedTank.outletPressure).toBe(0);
      expect(updatedTank.flowRate).toBe(0);
      expect(updatedTank.currentVolume).toBe(0);
      expect(updatedTank.currentVolumeHeight).toBe(0);
      expect(updatedTank.filledPercentage).toBe(0);
    });
  });

  describe("Pump Node", () => {
    it("should respect suction head limit", () => {
      const nodes: Node[] = [mockReservoir, mockPump];
      const pumpEdge: Edge = {
        ...mockEdge,
        sourceId: "reservoir-1",
        targetId: "pump-1",
      };

      const result = simulateStep(nodes, [pumpEdge]);
      const updatedPump = result.nodes[1] as PumpNode;

      expect(updatedPump.outletPressure).toBeLessThanOrEqual(
        (mockPump.totalHeadMax * GRAVITY_PRESSURE) / 100,
      );
    });

    it("should follow pump curve", () => {
      const nodes: Node[] = [mockReservoir, mockPump];
      const pumpEdge: Edge = {
        ...mockEdge,
        sourceId: "reservoir-1",
        targetId: "pump-1",
      };

      const result = simulateStep(nodes, [pumpEdge]);
      const updatedPump = result.nodes[1] as PumpNode;

      expect(updatedPump.flowRate).toBeLessThanOrEqual(mockPump.capacityMax);
    });
  });

  describe("Fitting Node", () => {
    it("should calculate pressure loss correctly", () => {
      const nodes: Node[] = [mockReservoir2, mockFitting2];
      const fittingEdge: Edge = {
        ...mockEdge,
        sourceId: "reservoir-2",
        targetId: "fitting-2",
      };

      const result = simulateStep(nodes, [fittingEdge]);
      const updatedFitting = result.nodes[1] as FittingNode;

      expect(updatedFitting.outletPressure).toBeLessThanOrEqual(
        mockReservoir.outletPressure,
      );
    });

    it("should handle zero diameter fitting", () => {
      const zeroDiameterFitting: FittingNode = {
        ...mockFitting,
        diameter: 0,
      };

      const nodes: Node[] = [mockReservoir, zeroDiameterFitting];
      const fittingEdge: Edge = {
        ...mockEdge,
        sourceId: "reservoir-1",
        targetId: "fitting-1",
      };

      const result = simulateStep(nodes, [fittingEdge]);
      const updatedFitting = result.nodes[1] as FittingNode;

      expect(updatedFitting.outletPressure).toBe(0);
      expect(updatedFitting.flowRate).toBe(0);
      expect(updatedFitting.velocity).toBe(0);
    });
  });

  describe("Edge Calculations", () => {
    it("should calculate flow rate using Hazen-Williams equation", () => {
      const nodes: Node[] = [mockReservoir, mockTank];
      const edges: Edge[] = [mockEdge];

      const result = simulateStep(nodes, edges);
      const updatedEdge = result.edges[0];

      expect(updatedEdge.flowRate).toBeGreaterThanOrEqual(0);
      expect(updatedEdge.velocity).toBeGreaterThanOrEqual(0);
    });

    it("should handle inactive nodes", () => {
      const inactiveTank: TankNode = {
        ...mockTank,
        active: false,
      };

      const nodes: Node[] = [mockReservoir, inactiveTank];
      const edges: Edge[] = [mockEdge];

      const result = simulateStep(nodes, edges);
      const updatedEdge = result.edges[0];

      expect(updatedEdge.flowRate).toBe(0);
      expect(updatedEdge.velocity).toBe(0);
    });
  });

  describe("Complex Network Scenarios", () => {
    it("should handle multiple connected nodes", () => {
      const reservoir2: ReservoirNode = {
        ...mockReservoir,
        id: "reservoir-2",
        position: { x: 400, y: 0 },
      };

      const tank2: TankNode = {
        ...mockTank,
        id: "tank-2",
        position: { x: 500, y: 0 },
      };

      const edge2: Edge = {
        ...mockEdge,
        id: "edge-2",
        sourceId: "tank-1",
        targetId: "tank-2",
      };

      const nodes: Node[] = [mockReservoir, mockTank, reservoir2, tank2];
      const edges: Edge[] = [mockEdge, edge2];

      const result = simulateStep(nodes, edges);

      const tank1Flow = result.nodes[1].flowRate;
      const tank2Flow = result.nodes[3].flowRate;
      expect(Math.abs(tank1Flow - tank2Flow)).toBeLessThan(0.1);
    });

    it("should handle closed valve", () => {
      const valve: ValveNode = {
        id: "valve-1",
        type: "valve",
        position: { x: 150, y: 0 },
        rotation: 0,
        elevation: 0,
        flowRate: 0,
        inletPressure: 0,
        outletPressure: 0,
        velocity: 0,
        active: true,
        status: "close",
        diameter: 100,
      };

      const valveEdge: Edge = {
        ...mockEdge,
        id: "edge-valve",
        sourceId: "reservoir-1",
        targetId: "valve-1",
      };

      const nodes: Node[] = [mockReservoir, valve];
      const edges: Edge[] = [valveEdge];

      const result = simulateStep(nodes, edges);
      const updatedValve = result.nodes[1] as ValveNode;

      expect(updatedValve.flowRate).toBe(0);
    });

    it("should handle pump curve interpolation", () => {
      const pump: PumpNode = {
        ...mockPump,
        curveFlow: [0, 25, 50, 75, 100],
        curveHead: [20, 18, 15, 10, 0],
      };

      const nodes: Node[] = [mockReservoir, pump];
      const pumpEdge: Edge = {
        ...mockEdge,
        sourceId: "reservoir-1",
        targetId: "pump-1",
      };

      const result = simulateStep(nodes, [pumpEdge]);
      const updatedPump = result.nodes[1] as PumpNode;

      expect(updatedPump.outletPressure).toBeGreaterThanOrEqual(0);
      expect(updatedPump.outletPressure).toBeLessThanOrEqual(
        (20 * GRAVITY_PRESSURE) / 100,
      );
    });

    it("should handle elevation changes", () => {
      const elevatedTank: TankNode = {
        ...mockTank,
        elevation: 10,
      };

      const nodes: Node[] = [mockReservoir, elevatedTank];
      const edges: Edge[] = [mockEdge];

      const result = simulateStep(nodes, edges);
      const updatedEdge = result.edges[0];

      expect(updatedEdge.flowRate).toBeLessThan(
        simulateStep([mockReservoir, mockTank], [mockEdge]).edges[0].flowRate,
      );
    });
  });
});

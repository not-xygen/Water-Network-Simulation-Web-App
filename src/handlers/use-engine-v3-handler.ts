import {
  FITTING_COEFFICIENTS,
  GRAVITY_PRESSURE,
  PIXEL_TO_CM,
} from "@/constant/globals";
import useNodeEdgeStore from "@/store/node-edge";
import useSimulationStore from "@/store/simulation";
import type {
  TankNode,
  PumpNode,
  FittingNode,
  Edge,
  Node,
} from "@/types/node-edge";

let simulationInterval: NodeJS.Timeout | null = null;
const MIN_SLOPE = 0.00001;
const GRAVITY_PRESSURE_DIV_100 = GRAVITY_PRESSURE / 100;
const PIXEL_TO_METER = PIXEL_TO_CM / 100;
const SIMULATION_INTERVAL = 1000;

const calculateVelocity = (flowRate: number, diameter: number): number => {
  const area = Math.PI * (diameter / 200) ** 2;
  return area > 0 ? Math.abs(flowRate) / 1000 / area : 0;
};

const interpolateFromCurve = (
  curveFlow: number[],
  curveHead: number[],
  currentFlow: number,
): number => {
  if (curveFlow.length === 0 || curveHead.length === 0) return 0;
  if (currentFlow <= curveFlow[0]) return curveHead[0];
  if (currentFlow >= curveFlow[curveFlow.length - 1])
    return curveHead[curveHead.length - 1];

  for (let i = 0; i < curveFlow.length - 1; i++) {
    if (currentFlow >= curveFlow[i] && currentFlow <= curveFlow[i + 1]) {
      const t =
        (currentFlow - curveFlow[i]) / (curveFlow[i + 1] - curveFlow[i]);
      return curveHead[i] + t * (curveHead[i + 1] - curveHead[i]);
    }
  }

  return 0;
};

const updateTank = (
  node: TankNode,
  netFlow: number,
  timeStep: number,
): TankNode => {
  const diameterM = node.diameter / 100;
  const heightM = node.height / 100;
  const radiusM = diameterM / 2;
  const baseArea = Math.PI * radiusM ** 2;
  const maxVolume = baseArea * heightM * 1000;

  const deltaVolume = netFlow * timeStep;
  const newVolume = Math.max(
    0,
    Math.min(node.currentVolume + deltaVolume, maxVolume),
  );

  const newHeight = newVolume / baseArea;
  const newPressure = newHeight * GRAVITY_PRESSURE_DIV_100;

  return {
    ...node,
    maxVolume,
    currentVolume: newVolume,
    currentVolumeHeight: newHeight,
    filledPercentage: (newVolume / maxVolume) * 100,
    pressure: newPressure,
    flowRate: netFlow,
  };
};

const updatePump = (
  node: PumpNode,
  connectedEdges: Edge[],
  allNodes: Node[],
): PumpNode => {
  const inflowEdge = connectedEdges.find((e) => e.targetId === node.id);
  const outflowEdge = connectedEdges.find((e) => e.sourceId === node.id);

  if (!inflowEdge || !outflowEdge) {
    return {
      ...node,
      flowRate: 0,
      outletPressure: 0,
      operatingHead: 0,
      inletPressure: 0,
    };
  }

  const sourceNode = allNodes.find((n) => n.id === inflowEdge.sourceId);
  const inletPressure = sourceNode?.pressure ?? 0;

  const flowRate = Math.abs(inflowEdge.flowRate);
  const operatingHead = interpolateFromCurve(
    node.curveFlow,
    node.curveHead,
    flowRate,
  );

  return {
    ...node,
    inletPressure,
    flowRate: inflowEdge.flowRate,
    operatingHead,
    outletPressure: inletPressure + operatingHead * GRAVITY_PRESSURE_DIV_100,
  };
};

const updateFitting = (
  node: FittingNode,
  netFlow: number,
  allNodes: Node[],
  edges: Edge[],
): FittingNode => {
  if (!node.diameter || node.diameter <= 0) {
    return {
      ...node,
      pressure: 0,
      flowRate: 0,
      velocity: 0,
      inletPressure: 0,
      outletPressure: 0,
    };
  }

  const inletEdge = edges.find((e) => e.targetId === node.id);

  const inletNode = inletEdge
    ? allNodes.find((n) => n.id === inletEdge.sourceId)
    : null;

  const inletPressure = inletNode?.pressure ?? 0;

  const diameterM = node.diameter / 100;
  const area = Math.PI * (diameterM / 2) ** 2;
  const velocity = area > 0 ? Math.abs(netFlow) / 1000 / area : 0;

  const coefficient =
    FITTING_COEFFICIENTS[node.subtype as keyof typeof FITTING_COEFFICIENTS] ||
    FITTING_COEFFICIENTS.default;

  const minorLoss = (coefficient * velocity ** 2) / (2 * 9.81);

  const newOutletPressure = Math.max(0, inletPressure - minorLoss);

  return {
    ...node,
    flowRate: netFlow,
    velocity,
    minorLossCoefficient: coefficient,
    inletPressure,
    outletPressure: newOutletPressure,
    pressure: newOutletPressure,
  };
};

const simulateStep = (
  nodes: Node[],
  edges: Edge[],
): { nodes: Node[]; edges: Edge[] } => {
  const updatedNodes = nodes.map((node) => {
    if (!node.active) return node;

    switch (node.type) {
      case "reservoir":
        return { ...node, pressure: node.head * GRAVITY_PRESSURE_DIV_100 };
      case "tank": {
        const diameterM = node.diameter / 100;
        const heightM = node.height / 100;
        const radiusM = diameterM / 2;
        const baseArea = Math.PI * radiusM ** 2;
        const maxVolume = baseArea * heightM;

        const basePressure =
          node.currentVolumeHeight * GRAVITY_PRESSURE_DIV_100;
        return {
          ...node,
          maxVolume,
          pressure: basePressure,
        };
      }
      default:
        return node;
    }
  });

  const pumpNodes = updatedNodes.filter((n) => n.type === "pump") as PumpNode[];
  const pumpsWithEdges = pumpNodes.map((pump) => {
    const connectedEdges = edges.filter(
      (e) => e.sourceId === pump.id || e.targetId === pump.id,
    );
    return updatePump(pump, connectedEdges, updatedNodes);
  });

  const nodesWithPumps = updatedNodes.map((node) =>
    node.type === "pump"
      ? pumpsWithEdges.find((p) => p.id === node.id) ?? node
      : node,
  );

  const updatedEdges = edges.map((edge) => {
    const sourceNode = nodesWithPumps.find((n) => n.id === edge.sourceId);
    const targetNode = nodesWithPumps.find((n) => n.id === edge.targetId);

    if (!sourceNode?.active || !targetNode?.active) {
      return { ...edge, flowRate: 0, velocity: 0 };
    }

    if (
      (sourceNode.type === "valve" && sourceNode.status === "close") ||
      (targetNode.type === "valve" && targetNode.status === "close")
    ) {
      return { ...edge, flowRate: 0, velocity: 0 };
    }

    if (sourceNode.type === "pump") {
      return {
        ...edge,
        flowRate: sourceNode.flowRate || 0,
        velocity: calculateVelocity(sourceNode.flowRate || 0, edge.diameter),
      };
    }

    const sourcePressure =
      sourceNode.type === "fitting"
        ? sourceNode.outletPressure ?? 0
        : sourceNode.pressure ?? 0;

    const targetPressure = targetNode.pressure ?? 0;

    const pressureDiff = sourcePressure - targetPressure;

    if (Math.abs(pressureDiff) <= MIN_SLOPE || Math.abs(pressureDiff) > 100) {
      return { ...edge, flowRate: 0, velocity: 0 };
    }

    const lengthM = edge.length * PIXEL_TO_METER;
    const diameterM = edge.diameter / 100;
    const slope = Math.abs(pressureDiff) / lengthM;
    let flowRate = 0.2785 * edge.roughness * diameterM ** 2.63 * slope ** 0.54;
    flowRate = Math.sign(pressureDiff) * flowRate;

    return {
      ...edge,
      flowRate,
      velocity: calculateVelocity(flowRate, edge.diameter),
    };
  });

  const finalNodes = nodesWithPumps.map((node) => {
    if (!node.active || node.type === "reservoir") return node;

    const inflowEdges = updatedEdges.filter((e) => e.targetId === node.id);
    const outflowEdges = updatedEdges.filter((e) => e.sourceId === node.id);

    const inflow = inflowEdges.reduce(
      (sum, e) => sum + (e.targetId === node.id ? e.flowRate : 0),
      0,
    );
    const outflow = outflowEdges.reduce(
      (sum, e) => sum + (e.sourceId === node.id ? e.flowRate : 0),
      0,
    );
    const netFlow = inflow - outflow;

    switch (node.type) {
      case "tank":
        return updateTank(node, netFlow, SIMULATION_INTERVAL / 1000);
      case "fitting":
        return updateFitting(node, netFlow, nodesWithPumps, updatedEdges);
      case "valve":
        return { ...node, flowRate: netFlow };
      default:
        return node;
    }
  });

  return { nodes: finalNodes, edges: updatedEdges };
};

export const startSimulation = () => {
  if (simulationInterval) return;

  useSimulationStore.setState({ running: true });

  simulationInterval = setInterval(() => {
    try {
      const { nodes, edges } = useNodeEdgeStore.getState();
      const { nodes: updatedNodes, edges: updatedEdges } = simulateStep(
        nodes,
        edges,
      );

      useNodeEdgeStore.setState({
        nodes: updatedNodes,
        edges: updatedEdges,
      });

      useSimulationStore.setState((prev) => ({
        step: prev.step + 1,
        elapsedTime: prev.elapsedTime + SIMULATION_INTERVAL,
      }));
    } catch (error) {
      console.error("Simulation error:", error);
      stopSimulation();
    }
  }, SIMULATION_INTERVAL);
};

export const stopSimulation = () => {
  if (!simulationInterval) return;
  clearInterval(simulationInterval);
  simulationInterval = null;
  useSimulationStore.setState({ running: false, paused: true });
};

export const resetSimulation = () => {
  stopSimulation();
  useNodeEdgeStore.setState((state) => ({
    nodes: state.nodes.map((node) => ({
      ...node,
      flowRate: 0,
      pressure: 0,
      ...(node.type === "tank"
        ? {
            currentVolume: 0,
            currentVolumeHeight: 0,
            filledPercentage: 0,
          }
        : {}),
      ...(node.type === "fitting"
        ? {
            inletPressure: 0,
            outletPressure: 0,
            velocity: 0,
          }
        : {}),
      ...(node.type === "pump"
        ? {
            operatingHead: 0,
            operatingFlow: 0,
          }
        : {}),
    })),
    edges: state.edges.map((edge) => ({
      ...edge,
      flowRate: 0,
      velocity: 0,
    })),
  }));
  useSimulationStore.setState({
    running: false,
    paused: false,
    step: 0,
    elapsedTime: 0,
  });
};

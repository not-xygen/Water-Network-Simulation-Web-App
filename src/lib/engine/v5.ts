import {
  GRAVITY_PRESSURE,
  MIN_PRESSURE_DIFF,
  PIXEL_TO_CM,
  PRESSURE_CONVERSION,
  SIMULATION_INTERVAL,
  WATER_DENSITY,
} from "@/constant/globals";
import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";
import useSimulationStore from "@/store/simulation";
import type {
  Edge,
  FittingNode,
  Node,
  PumpNode,
  ReservoirNode,
  TankNode,
  ValveNode,
} from "@/types/node-edge";

let simulationInterval: NodeJS.Timeout | null = null;
const dev = useGlobalStore.getState().developerMode;

/**
 * Calculate fluid velocity in pipe
 */
const calculateVelocity = (flowRate: number, diameter: number): number => {
  if (diameter <= 0) return 0;
  const area = Math.PI * (diameter / 100 / 2) ** 2;
  return area > 0 ? Math.abs(flowRate) / 10 / area : 0;
};

/**
 * Interpolate head from pump curve
 */
const interpolateFromCurve = (
  curveFlow: number[],
  curveHead: number[],
  currentFlow: number,
): number => {
  if (curveFlow.length === 0 || curveHead.length === 0) return 0;
  if (currentFlow <= curveFlow[0]) return curveHead[0];
  if (currentFlow >= curveFlow[curveFlow.length - 1]) {
    return curveHead[curveHead.length - 1];
  }

  for (let i = 0; i < curveFlow.length - 1; i++) {
    if (currentFlow >= curveFlow[i] && currentFlow <= curveFlow[i + 1]) {
      const t =
        (currentFlow - curveFlow[i]) / (curveFlow[i + 1] - curveFlow[i]);
      return curveHead[i] + t * (curveHead[i + 1] - curveHead[i]);
    }
  }
  return 0;
};

/**
 * Get node pressure in bar
 */
const getNodePressure = (node: Node): number => {
  if (node.type === "reservoir") {
    return node.head * WATER_DENSITY * GRAVITY_PRESSURE * PRESSURE_CONVERSION;
  }

  const elevationPressure =
    node.elevation * WATER_DENSITY * GRAVITY_PRESSURE * PRESSURE_CONVERSION;
  return (node.outletPressure || 0) + elevationPressure;
};

/**
 * Calculate edge flow rate based on pressure difference
 */
const calculateEdgeFlow = (
  edge: Edge,
  sourceNode: Node,
  targetNode: Node,
): Edge => {
  // Skip if nodes are inactive
  if (!sourceNode?.active || !targetNode?.active) {
    return { ...edge, flowRate: 0, velocity: 0 };
  }

  const sourcePressure = getNodePressure(sourceNode);
  const targetPressure = getNodePressure(targetNode);
  const pressureDiff = sourcePressure - targetPressure; // [bar]

  if (Math.abs(pressureDiff) <= MIN_PRESSURE_DIFF) {
    return { ...edge, flowRate: 0, velocity: 0 };
  }

  const lengthM = (edge.length * PIXEL_TO_CM) / 100; // [m]
  const diameterM = edge.diameter / 100; // [m]

  let flowRate =
    0.2785 *
    edge.roughness *
    diameterM ** 2.63 *
    (Math.abs(pressureDiff) / lengthM) ** 0.54;

  flowRate = Math.sign(pressureDiff) * flowRate; // [L/s]

  if (dev) {
    console.log(
      `Edge ${edge.id}: ${sourcePressure.toFixed(3)} → ${targetPressure.toFixed(
        3,
      )} bar, flow: ${flowRate.toFixed(3)} L/s`,
    );
  }

  return {
    ...edge,
    flowRate,
    velocity: calculateVelocity(Math.abs(flowRate), edge.diameter),
  };
};

/**
 * Update reservoir node
 */
const updateReservoir = (node: ReservoirNode): ReservoirNode => ({
  ...node,
  outletPressure:
    node.head * WATER_DENSITY * GRAVITY_PRESSURE * PRESSURE_CONVERSION,
  flowRate: 0,
});

/**
 * Update tank node
 */
const updateTank = (
  node: TankNode,
  dt: number,
  connectedEdges: Edge[],
): TankNode => {
  if (
    !node.diameter ||
    node.diameter <= 0 ||
    !node.height ||
    node.height <= 0
  ) {
    return {
      ...node,
      flowRate: 0,
      currentVolume: 0,
      currentVolumeHeight: 0,
      filledPercentage: 0,
      outletPressure: 0,
      inletPressure: 0,
      velocity: 0,
    };
  }

  const diameterM = node.diameter / 100;
  const baseArea = Math.PI * (diameterM / 2) ** 2;
  const maxVolume = baseArea * (node.height / 100) * 1000; // [L]

  let totalInflow = 0;
  let totalOutflow = 0;

  for (const edge of connectedEdges) {
    const flowRate = edge.flowRate || 0;
    if (edge.targetId === node.id && flowRate > 0) {
      totalInflow += flowRate;
    } else if (edge.sourceId === node.id && flowRate > 0) {
      totalOutflow += flowRate;
    }
  }

  const netFlow = totalInflow - totalOutflow;
  let newVolume = (node.currentVolume || 0) + netFlow * dt;
  newVolume = Math.max(0, Math.min(maxVolume, newVolume));

  const currentVolumeHeight = newVolume / 1000 / baseArea; // [m]
  const outletPressure =
    currentVolumeHeight *
    WATER_DENSITY *
    GRAVITY_PRESSURE *
    PRESSURE_CONVERSION;

  if (dev) {
    console.log(
      `Tank ${node.id}: Volume ${newVolume.toFixed(
        1,
      )}L, Inflow: ${totalInflow.toFixed(3)}, Outflow: ${totalOutflow.toFixed(
        3,
      )}`,
    );
  }

  return {
    ...node,
    currentVolume: newVolume,
    currentVolumeHeight,
    filledPercentage: (newVolume / maxVolume) * 100,
    inletPressure: 0,
    outletPressure,
    flowRate: netFlow,
    velocity: calculateVelocity(Math.abs(netFlow), node.diameter),
  };
};

/**
 * Update pump node
 */
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
      inletPressure: 0,
      outletPressure: 0,
      operatingHead: 0,
    };
  }

  const sourceNode = allNodes.find((x) => x.id === inflowEdge.sourceId);
  if (!sourceNode) return node;

  const inletPressure = getNodePressure(sourceNode);
  const flowRate = Math.abs(inflowEdge.flowRate || 0);
  const head = interpolateFromCurve(node.curveFlow, node.curveHead, flowRate);

  const pressureGain =
    head * WATER_DENSITY * GRAVITY_PRESSURE * PRESSURE_CONVERSION;
  const outletPressure = inletPressure + pressureGain;

  return {
    ...node,
    inletPressure,
    flowRate: inflowEdge.flowRate || 0,
    operatingHead: head,
    outletPressure,
  };
};

/**
 * Update fitting node
 */
const updateFitting = (
  node: FittingNode,
  connectedEdges: Edge[],
  allNodes: Node[],
): FittingNode => {
  const inletEdge = connectedEdges.find((e) => e.targetId === node.id);
  const outletEdge = connectedEdges.find((e) => e.sourceId === node.id);

  if (!inletEdge || !outletEdge) return node;

  const inletNode = allNodes.find((n) => n.id === inletEdge.sourceId);
  if (!inletNode) return node;

  const flowRate = inletEdge.flowRate || 0;
  const velocity = calculateVelocity(Math.abs(flowRate), node.diameter);
  const lossCoefficient = node.minorLossCoefficient ?? 0.3;

  const pressureLoss =
    ((lossCoefficient * WATER_DENSITY * velocity ** 2) / 2) *
    PRESSURE_CONVERSION;

  const inletPressure = getNodePressure(inletNode);
  const outletPressure = Math.max(0, inletPressure - pressureLoss);

  return {
    ...node,
    flowRate,
    velocity,
    inletPressure,
    outletPressure,
  };
};

/**
 * Update valve node
 */
const updateValve = (
  node: ValveNode,
  connectedEdges: Edge[],
  allNodes: Node[],
): ValveNode => {
  if (node.status === "close") {
    return {
      ...node,
      flowRate: 0,
      inletPressure: 0,
      outletPressure: 0,
    };
  }

  const inletEdge = connectedEdges.find((e) => e.targetId === node.id);
  const outletEdge = connectedEdges.find((e) => e.sourceId === node.id);

  if (!inletEdge || !outletEdge) return node;

  const inletNode = allNodes.find((n) => n.id === inletEdge.sourceId);
  if (!inletNode) return node;

  const flowRate = inletEdge.flowRate || 0;
  const velocity = calculateVelocity(Math.abs(flowRate), node.diameter);

  const lossCoefficient =
    node.minorLossCoefficient || (node.status === "open" ? 0.1 : 0.5);

  const pressureLoss =
    ((lossCoefficient * WATER_DENSITY * velocity ** 2) / 2) *
    PRESSURE_CONVERSION;

  const inletPressure = getNodePressure(inletNode);
  const outletPressure = Math.max(0, inletPressure - pressureLoss);

  return {
    ...node,
    flowRate,
    inletPressure,
    outletPressure,
  };
};

/**
 * Main simulation step
 */
export const simulateStep = (nodes: Node[], edges: Edge[]) => {
  // 1. Initialize reservoirs and inactive nodes
  const initializedNodes = nodes.map((node) => {
    if (!node.active) {
      return { ...node, flowRate: 0, inletPressure: 0, outletPressure: 0 };
    }
    return node.type === "reservoir" ? updateReservoir(node) : node;
  });

  // 2. Create node map for easy lookup
  const nodeMap = new Map<string, Node>(initializedNodes.map((n) => [n.id, n]));

  // 3. Calculate flow rates for all edges
  const updatedEdges = edges.map((edge) => {
    const sourceNode = nodeMap.get(edge.sourceId);
    const targetNode = nodeMap.get(edge.targetId);

    if (!sourceNode || !targetNode) return edge;

    return calculateEdgeFlow(edge, sourceNode, targetNode);
  });

  // 4. Update all nodes based on calculated flows
  const finalNodes = initializedNodes.map((node) => {
    if (!node.active || node.type === "reservoir") return node;

    const connectedEdges = updatedEdges.filter(
      (edge) => edge.sourceId === node.id || edge.targetId === node.id,
    );

    switch (node.type) {
      case "tank":
        return updateTank(node, SIMULATION_INTERVAL / 1000, connectedEdges);

      case "pump":
        return updatePump(node, connectedEdges, initializedNodes);

      case "fitting":
        return updateFitting(node, connectedEdges, initializedNodes);

      case "valve":
        return updateValve(node, connectedEdges, initializedNodes);

      default:
        return node;
    }
  });

  // 5. Recalculate edges with updated node pressures (second pass for accuracy)
  const finalNodeMap = new Map<string, Node>(finalNodes.map((n) => [n.id, n]));
  const finalEdges = edges.map((edge) => {
    const sourceNode = finalNodeMap.get(edge.sourceId);
    const targetNode = finalNodeMap.get(edge.targetId);

    if (!sourceNode || !targetNode) return edge;

    return calculateEdgeFlow(edge, sourceNode, targetNode);
  });

  return { nodes: finalNodes, edges: finalEdges };
};

export const startSimulation = () => {
  if (simulationInterval) return;
  useSimulationStore.setState({ running: true, paused: false });

  simulationInterval = setInterval(() => {
    try {
      const { nodes, edges } = useNodeEdgeStore.getState();
      const { nodes: updatedNodes, edges: updatedEdges } = simulateStep(
        nodes,
        edges,
      );

      useNodeEdgeStore.setState({ nodes: updatedNodes, edges: updatedEdges });
      useSimulationStore.setState((state) => ({
        step: state.step + 1,
        elapsedTime: state.elapsedTime + SIMULATION_INTERVAL / 1000,
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
      inletPressure: 0,
      outletPressure: 0,
      ...(node.type === "tank" && {
        currentVolume: 0,
        currentVolumeHeight: 0,
        filledPercentage: 0,
      }),
      ...(node.type === "fitting" && {
        velocity: 0,
      }),
      ...(node.type === "pump" && {
        operatingHead: 0,
      }),
    })),
    edges: state.edges.map((edge) => ({ ...edge, flowRate: 0, velocity: 0 })),
  }));
  useSimulationStore.setState({
    running: false,
    paused: false,
    step: 0,
    elapsedTime: 0,
  });
};

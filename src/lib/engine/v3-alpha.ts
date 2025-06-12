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
 * Calculate edge flow rate based on Hazen–Williams (Pers. 2.1 + 2.3)
 */
const calculateEdgeFlow = (
  edge: Edge,
  sourceNode: Node,
  targetNode: Node,
): Edge => {
  if (!sourceNode.active || !targetNode.active) {
    return { ...edge, flowRate: 0, velocity: 0 };
  }

  const sourcePressure = getNodePressure(sourceNode);
  const targetPressure = getNodePressure(targetNode);
  const pressureDiff = sourcePressure - targetPressure; // [bar]

  if (Math.abs(pressureDiff) <= MIN_PRESSURE_DIFF) {
    return { ...edge, flowRate: 0, velocity: 0 };
  }

  const L = (edge.length * PIXEL_TO_CM) / 100; // panjang pipa [m]
  const D = edge.diameter / 100; // diameter pipa [m]
  const C = edge.roughness; // koef. Hazen–Williams

  // 1. ubah pressureDiff (bar) → headDiff (m)
  const headDiff =
    pressureDiff / (WATER_DENSITY * GRAVITY_PRESSURE * PRESSURE_CONVERSION);

  // 2. Hitung Q (m³/s) via Hazen–Williams: HL = 10.67·L/(C^1.852·D^4.871)·Q^1.852
  const Q_m3s =
    Math.sign(headDiff) *
    Math.pow(
      (Math.abs(headDiff) * Math.pow(C, 1.852) * Math.pow(D, 4.871)) /
        (10.67 * L),
      1 / 1.852,
    );

  // 3. Konversi ke L/s
  const flowRate = Q_m3s / 10;

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
 * Update junction (konservasi massa Pers. 2.4)
 */
const updateJunction = (node: Node, edges: Edge[]): Node => {
  const inflow = edges
    .filter((e) => e.targetId === node.id)
    .reduce((sum, e) => sum + (e.flowRate || 0), 0);
  const outflow = edges
    .filter((e) => e.sourceId === node.id)
    .reduce((sum, e) => sum + (e.flowRate || 0), 0);
  const demand = (node as FittingNode).demand || 0;

  return {
    ...node,
    flowRate: inflow - outflow - demand,
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
  allNodes: Node[],
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

  const inletEdge = connectedEdges.find((e) => e.targetId === node.id);

  let inletPressure = 0;
  if (inletEdge) {
    const src = allNodes.find((n) => n.id === inletEdge.sourceId);
    if (src) inletPressure = getNodePressure(src);
  }

  const diameterM = node.diameter / 100;
  const baseArea = Math.PI * (diameterM / 2) ** 2;
  const maxVolume = baseArea * (node.height / 100) * 1000; // [L]

  let totalInflow = 0;
  let totalOutflow = 0;
  for (const edge of connectedEdges) {
    const f = edge.flowRate || 0;
    if (edge.targetId === node.id && f > 0) totalInflow += f;
    if (edge.sourceId === node.id && f > 0) totalOutflow += f;
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
      )}L, Inflow ${totalInflow.toFixed(3)}, Outflow ${totalOutflow.toFixed(
        3,
      )}`,
    );
  }

  return {
    ...node,
    currentVolume: newVolume,
    currentVolumeHeight,
    filledPercentage: (newVolume / maxVolume) * 100,
    inletPressure: inletPressure,
    outletPressure,
    flowRate: netFlow,
    velocity: calculateVelocity(Math.abs(netFlow), node.diameter),
  };
};

/**
 * Update pump node berdasarkan karakteristik (Pers. 2.2)
 */
const updatePump = (
  node: PumpNode,
  connectedEdges: Edge[],
  allNodes: Node[],
): PumpNode => {
  const inletEdge = connectedEdges.find((e) => e.targetId === node.id);
  if (!inletEdge)
    return {
      ...node,
      flowRate: 0,
      inletPressure: 0,
      outletPressure: 0,
      operatingHead: 0,
    };

  const src = allNodes.find((n) => n.id === inletEdge.sourceId);
  if (!src) return node;

  const inletPressure = getNodePressure(src);
  const Q = Math.abs(inletEdge.flowRate || 0); // [L/s]

  const h0 = node.totalHeadMax; // shut-off head [m]
  const Qmax = node.capacityMax; // max flow [L/s]
  const n = 2;
  const r = h0 / Math.pow(Qmax, n);
  const w = 1;

  // Pers. 2.2: h_Lij = –w³ (h₀ – r·(Qij/w)ⁿ)
  const headLoss = -Math.pow(w, 3) * (h0 - r * Math.pow(Q / w, n));
  const operatingHead = -headLoss;
  const pressureGain =
    operatingHead * WATER_DENSITY * GRAVITY_PRESSURE * PRESSURE_CONVERSION;

  return {
    ...node,
    inletPressure,
    flowRate: inletEdge.flowRate || 0,
    operatingHead,
    outletPressure: inletPressure + pressureGain,
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
  console.log(inletEdge.flowRate);

  const flowRate = inletEdge.flowRate || 0;
  const velocity = calculateVelocity(Math.abs(flowRate), node.diameter);
  const kL = node.minorLossCoefficient ?? 0.3;
  const pressureLoss =
    ((kL * WATER_DENSITY * velocity ** 2) / 2) * PRESSURE_CONVERSION;

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
      velocity: 0,
    };
  }

  const inletEdge = connectedEdges.find((e) => e.targetId === node.id);
  const outletEdge = connectedEdges.find((e) => e.sourceId === node.id);

  if (!inletEdge)
    return { ...node, flowRate: 0, inletPressure: 0, outletPressure: 0 };

  const inletNode = allNodes.find((n) => n.id === inletEdge.sourceId)!;
  const inletPressure = getNodePressure(inletNode);
  const flowRate = inletEdge.flowRate || 0;
  const velocity = calculateVelocity(Math.abs(flowRate), node.diameter);

  let outletPressure: number;
  if (!outletEdge) {
    outletPressure = 0;
  } else {
    const kL =
      node.minorLossCoefficient ?? (node.status === "open" ? 0.1 : 0.5);
    const pressureLoss =
      ((kL * WATER_DENSITY * velocity ** 2) / 2) * PRESSURE_CONVERSION;
    outletPressure = Math.max(0, inletPressure - pressureLoss);
  }

  return { ...node, flowRate, velocity, inletPressure, outletPressure };
};

/**
 * Main simulation step
 */
export const simulateStep = (nodes: Node[], edges: Edge[]) => {
  // 1. Initialize reservoirs dan node inactive
  const initializedNodes = nodes.map((node) => {
    if (!node.active) {
      return { ...node, flowRate: 0, inletPressure: 0, outletPressure: 0 };
    }
    return node.type === "reservoir" ? updateReservoir(node) : node;
  });

  // 2. Buat map utk lookup cepat
  const nodeMap = new Map<string, Node>(initializedNodes.map((n) => [n.id, n]));

  // 3. Hitung flow rate semua edges (pass 1)
  const updatedEdges = edges.map((edge) => {
    const src = nodeMap.get(edge.sourceId);
    const tgt = nodeMap.get(edge.targetId);
    if (!src || !tgt) return edge;
    return calculateEdgeFlow(edge, src, tgt);
  });

  // 4. Update semua nodes
  const finalNodes = initializedNodes.map((node) => {
    if (!node.active || node.type === "reservoir") return node;

    const ce = updatedEdges.filter(
      (e) => e.sourceId === node.id || e.targetId === node.id,
    );
    switch (node.type) {
      case "tank":
        return updateTank(
          node,
          SIMULATION_INTERVAL / 1000,
          ce,
          initializedNodes,
        );
      case "pump":
        return updatePump(node, ce, initializedNodes);
      case "fitting":
        return updateFitting(node, ce, initializedNodes);
      case "valve":
        return updateValve(node, ce, initializedNodes);
      default:
        return updateJunction(node, ce);
    }
  });

  // 5. Hitung ulang edges utk akurasi (pass 2)
  const finalMap = new Map<string, Node>(finalNodes.map((n) => [n.id, n]));
  const finalEdges = edges.map((edge) => {
    const src = finalMap.get(edge.sourceId);
    const tgt = finalMap.get(edge.targetId);
    if (!src || !tgt) return edge;
    return calculateEdgeFlow(edge, src, tgt);
  });

  return { nodes: finalNodes, edges: finalEdges };
};

/**
 * Kontrol simulasi
 */
export const startSimulation = () => {
  if (simulationInterval) return;
  useSimulationStore.setState({ running: true, paused: false });
  simulationInterval = setInterval(() => {
    try {
      const { nodes, edges } = useNodeEdgeStore.getState();
      const { nodes: n2, edges: e2 } = simulateStep(nodes, edges);
      useNodeEdgeStore.setState({ nodes: n2, edges: e2 });
      useSimulationStore.setState((s) => ({
        step: s.step + 1,
        elapsedTime: s.elapsedTime + SIMULATION_INTERVAL / 1000,
      }));
    } catch (err) {
      console.error("Simulation error:", err);
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
  useNodeEdgeStore.setState((s) => ({
    nodes: s.nodes.map((node) => ({
      ...node,
      flowRate: 0,
      inletPressure: 0,
      outletPressure: 0,
      ...(node.type === "tank" && {
        currentVolume: 0,
        currentVolumeHeight: 0,
        filledPercentage: 0,
      }),
      ...(node.type === "fitting" && { velocity: 0 }),
      ...(node.type === "pump" && { operatingHead: 0 }),
    })),
    edges: s.edges.map((edge) => ({ ...edge, flowRate: 0, velocity: 0 })),
  }));
  useSimulationStore.setState({
    running: false,
    paused: false,
    step: 0,
    elapsedTime: 0,
  });
};

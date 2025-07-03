import {
  FITTING_COEFFICIENTS,
  GRAVITY_PRESSURE,
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
  const area = Math.PI * (diameter / 2) ** 2;
  const Q_m3s = Math.abs(flowRate) / 1000;
  return area > 0 ? Q_m3s / area : 0;
};

/**
 * Get node pressure in bar
 */
const getNodePressure = (node: Node): number => {
  if (node.type === "reservoir") {
    return (node.head * WATER_DENSITY * GRAVITY_PRESSURE) / PRESSURE_CONVERSION;
  }
  const pressure = node.outletPressure ?? node.inletPressure ?? 0;
  return (
    (node.elevation * WATER_DENSITY * GRAVITY_PRESSURE) / PRESSURE_CONVERSION +
    pressure
  );
};

/**
 * Calculate edge flow rate based on Hazen–Williams (Pers. 2.1 + 2.3)
 */
const calculateEdgeFlow = (
  edge: Edge,
  sourceNode: Node,
  targetNode: Node,
): Edge => {
  if (
    !sourceNode.active ||
    !targetNode.active ||
    (sourceNode.type === "valve" && sourceNode.status === "close") ||
    (sourceNode.type === "tank" &&
      "currentVolume" in sourceNode &&
      (sourceNode.currentVolume ?? 0) <= 0)
  ) {
    return { ...edge, flowRate: 0, velocity: 0 };
  }

  const sourceHead = getHeadForSource(sourceNode);
  const targetHead = getHeadForTarget(targetNode);
  let headDiff = sourceHead - targetHead;

  // batasi headDiff
  headDiff = Math.max(-50, Math.min(50, headDiff));
  if (Math.abs(headDiff) < 1e-6) {
    return { ...edge, flowRate: 0, velocity: 0 };
  }

  const L = (edge.length * PIXEL_TO_CM) / 100; // m
  const D = edge.diameter / 1000; // m
  const C = edge.roughness;

  const hf = Math.abs(headDiff);
  const num = hf * Math.pow(C, 1.852) * Math.pow(D, 4.871);
  const Q_m3s =
    Math.sign(headDiff) * Math.pow(num / (10.67 * L), 0.918 / 1.852);
  let flowRate = Q_m3s * 1000; // L/s

  // jangan lebih besar dari kemampuan sumber
  const sourceAvailable = sourceNode.flowRate ?? Infinity;
  flowRate = Math.min(flowRate, sourceAvailable);

  const velocity = calculateVelocity(flowRate, D);

  if (dev) {
    console.log(
      `Edge ${edge.id}: headDiff=${headDiff.toFixed(2)}m, Q=${flowRate.toFixed(
        3,
      )}L/s, V=${velocity.toFixed(3)}m/s`,
    );
  }

  return { ...edge, flowRate, velocity };
};

/**
 * Update reservoir node
 */
const updateReservoir = (node: ReservoirNode): ReservoirNode => ({
  ...node,
  outletPressure:
    (node.head * WATER_DENSITY * GRAVITY_PRESSURE) / PRESSURE_CONVERSION,
  flowRate: 0,
});

/**
 * Update tank node - FIXED VERSION
 */
const updateTank = (
  node: TankNode,
  dt: number,
  connectedEdges: Edge[],
  allNodes: Node[],
): TankNode => {
  if (
    !node.tankDiameter ||
    node.tankDiameter <= 0 ||
    !node.tankHeight ||
    node.tankHeight <= 0
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

  const diameterM = node.tankDiameter / 100; // [cm] -> [m]
  const baseArea = Math.PI * (diameterM / 2) ** 2;
  const maxVolume = baseArea * (node.tankHeight / 100) * 1000; // [L]

  const currentVolume = node.currentVolume || 0;
  const currentVolumeHeight = currentVolume / 1000 / baseArea; // [m]
  const outletPressure =
    (currentVolumeHeight * WATER_DENSITY * GRAVITY_PRESSURE) /
    PRESSURE_CONVERSION;

  let totalInflow = 0;
  let totalOutflow = 0;

  const someFactor = 1.0;

  for (const edge of connectedEdges) {
    const flowRate = edge.flowRate || 0;

    if (edge.targetId === node.id) {
      totalInflow += Math.abs(flowRate);
    } else if (edge.sourceId === node.id) {
      const downstream = allNodes.find((n) => n.id === edge.targetId);
      const downstreamPressure = downstream ? getNodePressure(downstream) : 0;

      if (outletPressure > downstreamPressure) {
        const pressureDiff = outletPressure - downstreamPressure;
        const adjustedFlowRate = Math.min(
          Math.abs(flowRate),
          pressureDiff * someFactor,
        );

        totalOutflow += adjustedFlowRate;
      }
    }
  }

  const netFlow = totalInflow - totalOutflow;

  let newVolume = currentVolume + netFlow * dt;
  newVolume = Math.max(0, Math.min(maxVolume, newVolume));

  const newVolumeHeight = newVolume / 1000 / baseArea; // [m]
  const newOutletPressure =
    (newVolumeHeight * WATER_DENSITY * GRAVITY_PRESSURE) / PRESSURE_CONVERSION;

  if (dev) {
    console.log(
      `Tank ${node.id}: Volume ${newVolume.toFixed(
        1,
      )}L, Net Flow ${netFlow.toFixed(6)}, Inflow ${totalInflow.toFixed(
        6,
      )}, Outflow ${totalOutflow.toFixed(6)}`,
    );
  }

  return {
    ...node,
    currentVolume: newVolume,
    currentVolumeHeight: newVolumeHeight,
    filledPercentage: (newVolume / maxVolume) * 100,
    inletPressure,
    outletPressure: newOutletPressure,
    flowRate: netFlow,
    velocity: calculateVelocity(Math.abs(netFlow), node.outletDiameter / 1000),
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

  const h0 = node.totalHeadMax; // [m]
  const Qmax = node.capacityMax; // [L/s]
  const n = 2;
  const r = h0 / Math.pow(Qmax, n);
  const w = 1;

  const headLoss = -Math.pow(w, 3) * (h0 - r * Math.pow(Q / w, n));
  const operatingHead = -headLoss;
  const pressureGain =
    (operatingHead * WATER_DENSITY * GRAVITY_PRESSURE) / PRESSURE_CONVERSION;

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
  if (!inletEdge) return node;

  const inletNode = allNodes.find((n) => n.id === inletEdge.sourceId)!;
  const flowRate = inletEdge.flowRate || 0;
  const velocity = calculateVelocity(
    Math.abs(flowRate),
    inletEdge.diameter * 1000,
  );

  const kL =
    node.minorLossCoefficient ||
    FITTING_COEFFICIENTS[node.subtype || "default"] ||
    0.5;

  const pressureLoss =
    (kL * WATER_DENSITY * velocity ** 2) / 2 / PRESSURE_CONVERSION;

  return {
    ...node,
    flowRate,
    velocity,
    inletPressure: getNodePressure(inletNode),
    outletPressure: getNodePressure(inletNode) - pressureLoss,
    minorLossCoefficient: kL,
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
  const velocity = calculateVelocity(
    Math.abs(flowRate) / 1000,
    node.diameter / 1000,
  );

  let outletPressure: number;
  if (!outletEdge) {
    outletPressure = 0;
  } else {
    const kL =
      node.minorLossCoefficient ?? (node.status === "open" ? 0.1 : 0.5);
    const pressureLoss =
      (kL * WATER_DENSITY * velocity ** 2) / 2 / PRESSURE_CONVERSION;
    outletPressure = Math.max(0, inletPressure - pressureLoss);
  }

  return { ...node, flowRate, velocity, inletPressure, outletPressure };
};

/**
 * Main simulation step
 */
export const simulateStep = (nodes: Node[], edges: Edge[]) => {
  // 1. Initialize semua nodes dan pastikan reservoir ter-update
  const initializedNodes = nodes.map((node) => {
    if (!node.active) {
      return { ...node, flowRate: 0, inletPressure: 0, outletPressure: 0 };
    }

    if (node.type === "reservoir") {
      return updateReservoir(node);
    }

    return {
      ...node,
      inletPressure: node.inletPressure || 0,
      outletPressure: node.outletPressure || 0,
      flowRate: node.flowRate || 0,
    };
  });

  if (dev) {
    console.log("=== Simulation Step Start ===");
    initializedNodes.forEach((node) => {
      if (node.type === "reservoir") {
        console.log(
          `Reservoir ${node.id}: head=${
            node.head
          }m, outletPressure=${node.outletPressure?.toFixed(6)}bar`,
        );
      }
    });
  }

  // 2. Buat map untuk lookup cepat
  let nodeMap = new Map<string, Node>(initializedNodes.map((n) => [n.id, n]));

  // 3. Iterasi untuk mencapai konvergensi
  let currentNodes = [...initializedNodes];

  for (let iteration = 0; iteration < 10; iteration++) {
    nodeMap = new Map<string, Node>(currentNodes.map((n) => [n.id, n]));

    const updatedEdges = edges.map((edge) => {
      const src = nodeMap.get(edge.sourceId);
      const tgt = nodeMap.get(edge.targetId);
      if (!src || !tgt) return edge;
      return calculateEdgeFlow(edge, src, tgt);
    });

    // Update nodes berdasarkan edges yang baru dihitung
    const newNodes = currentNodes.map((node) => {
      if (!node.active || node.type === "reservoir") return node;

      const connectedEdges = updatedEdges.filter(
        (e) => e.sourceId === node.id || e.targetId === node.id,
      );

      switch (node.type) {
        case "tank":
          return updateTank(
            node,
            SIMULATION_INTERVAL / 1000,
            connectedEdges,
            currentNodes,
          );
        case "pump":
          return updatePump(node, connectedEdges, currentNodes);
        case "fitting":
          return updateFitting(node, connectedEdges, currentNodes);
        case "valve":
          return updateValve(node, connectedEdges, currentNodes);
        default:
          return node;
      }
    });

    const maxFlowChange = newNodes.reduce((max, newNode, i) => {
      const oldNode = currentNodes[i];
      const flowChange = Math.abs(
        (newNode.flowRate || 0) - (oldNode.flowRate || 0),
      );
      return Math.max(max, flowChange);
    }, 0);

    currentNodes = newNodes;

    if (dev && iteration === 0) {
      console.log(
        `Iteration ${iteration}: maxFlowChange = ${maxFlowChange.toFixed(8)}`,
      );
    }

    if (maxFlowChange < 1e-8 && iteration > 2) {
      if (dev) console.log(`Converged at iteration ${iteration}`);
      break;
    }
  }

  const finalNodeMap = new Map<string, Node>(
    currentNodes.map((n) => [n.id, n]),
  );
  const finalEdges = edges.map((edge) => {
    const src = finalNodeMap.get(edge.sourceId);
    const tgt = finalNodeMap.get(edge.targetId);
    if (!src || !tgt) return edge;
    return calculateEdgeFlow(edge, src, tgt);
  });

  if (dev) {
    console.log("=== Final Results ===");
    finalEdges.forEach((edge) => {
      if (Math.abs(edge.flowRate || 0) > 1e-6) {
        console.log(
          `Edge ${edge.id}: flowRate=${edge.flowRate?.toFixed(6)} L/s`,
        );
      }
    });
    console.log("=== Simulation Step End ===");
  }

  return { nodes: currentNodes, edges: finalEdges };
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

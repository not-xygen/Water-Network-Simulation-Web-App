import { GRAVITY_PRESSURE, PIXEL_TO_CM } from "@/constant/globals";
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

const MIN_SLOPE = 0.00001;
const GRAVITY = 9.81; // m/s²

// ────────────────────────────── Global Variables ───────────────────────────
let simulationInterval: NodeJS.Timeout | null = null;

// ─────────────────────────────── Constants ────────────────────────────────
const SIMULATION_INTERVAL = 1000; // [ms]

// ───────────────────────────── Helper Utilities ────────────────────────────
const calculateVelocity = (Q: number, D: number): number => {
  // Q [L/s], D [m] → v [m/s]
  const area = Math.PI * (D / 100 / 2) ** 2; // [m²]
  return area > 0 ? Math.abs(Q) / 1000 / area : 0;
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

// ───────────────────────────── recalculateEdge() ───────────────────────────────
const recalculateEdge = (e: Edge, nodeMap: Map<string, Node>): Edge => {
  const sourceNode = nodeMap.get(e.sourceId);
  const targetNode = nodeMap.get(e.targetId);

  if (!sourceNode?.active || !targetNode?.active) {
    return { ...e, flowRate: 0, velocity: 0 };
  }

  const sourcePressure =
    sourceNode.pressure + sourceNode.elevation * GRAVITY_PRESSURE;
  const targetPressure =
    targetNode.pressure + targetNode.elevation * GRAVITY_PRESSURE;

  const pressureDiff = sourcePressure - targetPressure;

  if (Math.abs(pressureDiff) <= MIN_SLOPE) {
    return { ...e, flowRate: 0, velocity: 0 };
  }

  const lengthM = (e.length * PIXEL_TO_CM) / 100;
  const diameterM = e.diameter / 100;
  const slope = Math.abs(pressureDiff) / lengthM;

  let flowRate = 0.2785 * e.roughness * diameterM ** 2.63 * slope ** 0.54;
  flowRate = Math.sign(pressureDiff) * flowRate;

  return {
    ...e,
    flowRate,
    velocity: calculateVelocity(flowRate, e.diameter),
  };
};

const updateReservoir = (n: ReservoirNode): ReservoirNode => ({
  ...n,
  pressure: n.head * (GRAVITY_PRESSURE / 100),
  flowRate: 0,
});

const updateTank = (n: TankNode, netFlow: number, dt: number): TankNode => {
  if (!n.diameter || n.diameter <= 0) {
    return {
      ...n,
      pressure: 0,
      flowRate: 0,
      currentVolume: 0,
      currentVolumeHeight: 0,
      filledPercentage: 0,
    };
  }

  const diameterM = n.diameter / 100;
  const heightM = n.height / 100;
  const radiusM = diameterM / 2;
  const baseArea = Math.PI * radiusM ** 2;
  const maxVolume = baseArea * heightM * 1000;

  const currentVolume = Math.max(
    0,
    Math.min(maxVolume, (n.currentVolume || 0) + netFlow * dt),
  );
  const currentVolumeHeight = ((currentVolume / baseArea) * 100) / 10000;
  const filledPercentage = (currentVolume / maxVolume) * 100;

  // Calculate pressure considering elevation
  const hydrostaticPressure = (currentVolumeHeight * GRAVITY_PRESSURE) / 100;
  const elevationPressure = (n.elevation * GRAVITY_PRESSURE) / 100;
  const totalPressure = hydrostaticPressure + elevationPressure;

  return {
    ...n,
    maxVolume,
    currentVolume,
    currentVolumeHeight,
    filledPercentage,
    pressure: totalPressure,
    flowRate: netFlow,
  };
};

const updatePump = (
  n: PumpNode,
  connEdges: Edge[],
  allNodes: Node[],
): PumpNode => {
  const inflowEdge = connEdges.find((e) => e.targetId === n.id);
  const outflowEdge = connEdges.find((e) => e.sourceId === n.id);
  if (!inflowEdge || !outflowEdge)
    return {
      ...n,
      flowRate: 0,
      inletPressure: 0,
      outletPressure: 0,
      operatingHead: 0,
      pressure: 0,
    };

  const srcNode = allNodes.find((x) => x.id === inflowEdge.sourceId);
  const inletP = srcNode?.pressure ?? 0; // [bar]
  const Qabs = inflowEdge.flowRate; // [L/s]
  const head = interpolateFromCurve(n.curveFlow, n.curveHead, Qabs); // [m]
  const outletP = inletP + head * (GRAVITY_PRESSURE / 100); // [bar]

  return {
    ...n,
    inletPressure: inletP,
    flowRate: inflowEdge.flowRate,
    operatingHead: head,
    outletPressure: outletP,
    pressure: outletP,
  };
};

const updateFitting = (
  n: FittingNode,
  netFlow: number,
  nodes: Node[],
  edges: Edge[],
): FittingNode => {
  if (!n.diameter || n.diameter <= 0) {
    return {
      ...n,
      pressure: 0,
      flowRate: 0,
      velocity: 0,
      inletPressure: 0,
      outletPressure: 0,
    };
  }

  const inletEdge = edges.find((e) => e.targetId === n.id);
  const outletEdge = edges.find((e) => e.sourceId === n.id);

  if (!inletEdge || !outletEdge) return n;

  const inletNode = nodes.find((node) => node.id === inletEdge.sourceId);
  if (!inletNode) return n;

  // Calculate inlet pressure considering elevation
  const inletPressure =
    inletNode.pressure + (inletNode.elevation * GRAVITY_PRESSURE) / 100;

  // Calculate pressure loss using Darcy-Weisbach equation
  const velocity = calculateVelocity(netFlow, n.diameter);
  const lossCoefficient = n.minorLossCoefficient ?? 0.5; // Default value if undefined
  const pressureLoss = (lossCoefficient * velocity * velocity) / (2 * GRAVITY);

  // Calculate outlet pressure
  const outletPressure = Math.max(0, inletPressure - pressureLoss);

  return {
    ...n,
    flowRate: netFlow,
    velocity,
    inletPressure,
    outletPressure,
    pressure: outletPressure - (n.elevation * GRAVITY_PRESSURE) / 100,
  };
};

const updateValve = (n: ValveNode, netFlow: number): ValveNode =>
  n.status === "close"
    ? { ...n, flowRate: 0, pressure: 0 }
    : {
        ...n,
        flowRate: netFlow,
        pressure: Math.max(0, (n.pressure || 0) - (n.lossCoefficient || 0.05)),
      };

// ──────────────────────────── Single Simulation Step ──────────────────────────
export const simulateStep = (nodes: Node[], edges: Edge[]) => {
  // 1) Update reservoir & inactive nodes
  const initNodes = nodes.map((n) => {
    if (!n.active) return { ...n, flowRate: 0, pressure: 0 };
    return n.type === "reservoir" ? updateReservoir(n) : n;
  });

  // 2) Initial node map
  const nodeMap = new Map<string, Node>(initNodes.map((n) => [n.id, n]));

  // 3) Pass-1 edges
  const passEdges = edges.map((e) => recalculateEdge(e, nodeMap));

  // 4) Update all pumps
  const pumpNodes = initNodes
    .filter((n) => n.type === "pump")
    .map((p) => updatePump(p as PumpNode, passEdges, initNodes));
  const pumpMap = new Map(pumpNodes.map((p) => [p.id, p]));

  // 5) Merge node maps → mergedMap
  const mergedMap = new Map(nodeMap);
  for (const [id, pump] of pumpMap) {
    mergedMap.set(id, pump);
  }

  // 6) Pass-2 edges around pumps
  const finalEdges = passEdges.map((e) =>
    pumpMap.has(e.sourceId) || pumpMap.has(e.targetId)
      ? recalculateEdge(e, mergedMap)
      : e,
  );

  // 7) Nodes with updated pumps
  const nodesWithPumps = initNodes.map((n) =>
    n.type === "pump" ? pumpMap.get(n.id) ?? n : n,
  );

  // 8) Update tank, fitting, valve based on netFlow using finalEdges
  const finalNodes = nodesWithPumps.map((n) => {
    if (!n.active || n.type === "reservoir") return n;

    const inflow = finalEdges
      .filter((e) => e.targetId === n.id)
      .reduce((s, e) => s + e.flowRate, 0);
    const outflow = finalEdges
      .filter((e) => e.sourceId === n.id)
      .reduce((s, e) => s + e.flowRate, 0);
    const netFlow = inflow - outflow;

    switch (n.type) {
      case "tank":
        return updateTank(n, netFlow, SIMULATION_INTERVAL / 1000);
      case "fitting":
        return updateFitting(n, netFlow, nodesWithPumps, finalEdges);
      case "valve":
        return updateValve(n, netFlow);
      default:
        return n;
    }
  });

  return { nodes: finalNodes, edges: finalEdges };
};

// ──────────────────────────── Public Store API ────────────────────────────
export const startSimulation = () => {
  if (simulationInterval) return; // already running
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
      console.error("Simulation error", err);
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
  useNodeEdgeStore.setState((st) => ({
    nodes: st.nodes.map((n) => ({
      ...n,
      flowRate: 0,
      pressure: 0,
      ...(n.type === "tank" && {
        currentVolume: 0,
        currentVolumeHeight: 0,
        filledPercentage: 0,
      }),
      ...(n.type === "fitting" && {
        inletPressure: 0,
        outletPressure: 0,
        velocity: 0,
      }),
      ...(n.type === "pump" && {
        operatingHead: 0,
        inletPressure: 0,
        outletPressure: 0,
      }),
    })),
    edges: st.edges.map((e) => ({ ...e, flowRate: 0, velocity: 0 })),
  }));
  useSimulationStore.setState({
    running: false,
    paused: false,
    step: 0,
    elapsedTime: 0,
  });
};

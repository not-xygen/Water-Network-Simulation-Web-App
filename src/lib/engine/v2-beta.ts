import {
  FITTING_COEFFICIENTS,
  GRAVITY_PRESSURE,
  PIXEL_TO_CM,
} from "@/constant/globals";
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
let simulationInterval: NodeJS.Timeout | null = null;
const SIMULATION_INTERVAL = 1000; // [ms]
const calculateVelocity = (Q: number, D: number): number => {
  // Q [L/s], D [m] → v [m/s]
  const area = Math.PI * (D / 100 / 2) ** 2; // [m²]
  return area > 0 ? Math.abs(Q) / area : 0;
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

const recalculateEdge = (edge: Edge, nodeMap: Map<string, Node>): Edge => {
  const src = nodeMap.get(edge.sourceId);
  const dst = nodeMap.get(edge.targetId);
  if (!src || !dst) return { ...edge, flowRate: 0, velocity: 0 };

  let pSrc =
    src.type === "fitting" ? src.outletPressure ?? 0 : src.outletPressure ?? 0;
  const pDst =
    dst.type === "fitting" ? dst.outletPressure ?? 0 : dst.outletPressure ?? 0;

  if (dst.type === "pump") {
    const limit = (dst.suctionHeadMax ?? 0) * (GRAVITY_PRESSURE / 100000);
    if (pSrc < limit) return { ...edge, flowRate: 0, velocity: 0 };
    pSrc = Math.max(0, pSrc - 0.2);
  }

  const dP = pSrc - pDst;
  if (Math.abs(dP) < MIN_SLOPE) return { ...edge, flowRate: 0, velocity: 0 };

  const L = edge.length * (PIXEL_TO_CM / 100); // [m]
  const D = edge.diameter / 100; // [cm→m]
  const S = Math.abs(dP) / L; // [gradient]
  let Q = 0.2785 * edge.roughness * D ** 2.63 * S ** 0.54; // L/s
  Q *= Math.sign(dP);

  if (src.type === "fitting" && src.diameter) {
    const Dfit = Math.min(src.diameter, edge.diameter) / 100;
    Q = Math.min(Q, 0.2785 * edge.roughness * Dfit ** 2.63 * S ** 0.54);
  }

  return {
    ...edge,
    flowRate: Q * 1000,
    velocity: calculateVelocity(Q, edge.diameter),
  };
};

const updateReservoir = (n: ReservoirNode): ReservoirNode => ({
  ...n,
  inletPressure: n.head * (GRAVITY_PRESSURE / 100),
  outletPressure: n.head * (GRAVITY_PRESSURE / 100),
  flowRate: 0,
});

const updateTank = (n: TankNode, netFlow: number, dt: number): TankNode => {
  const diamM = n.tankDiameter / 100; // [cm→m]
  const hM = n.tankHeight / 100;
  const rM = diamM / 2;
  const baseArea = Math.PI * rM ** 2; // [m²]
  const maxVol = baseArea * hM * 1000; // [L]
  const dV = netFlow * dt; // [L]
  const vol = Math.min(Math.max(0, n.currentVolume + dV), maxVol);
  const h = vol / baseArea / 1000; // [m]
  const p = h * (GRAVITY_PRESSURE / 100); // [bar]

  return {
    ...n,
    maxVolume: maxVol,
    currentVolume: vol,
    currentVolumeHeight: h,
    filledPercentage: (vol / maxVol) * 100,
    inletPressure: p,
    outletPressure: p,
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
    };

  const srcNode = allNodes.find((x) => x.id === inflowEdge.sourceId);
  const inletP = srcNode?.outletPressure ?? 0; // [bar]
  const Qabs = inflowEdge.flowRate; // [L/s]
  const head = interpolateFromCurve(n.curveFlow, n.curveHead, Qabs); // [m]
  const outletP = inletP + head * (GRAVITY_PRESSURE / 100); // [bar]

  return {
    ...n,
    inletPressure: inletP,
    flowRate: inflowEdge.flowRate,
    operatingHead: head,
    outletPressure: outletP,
  };
};

const updateFitting = (
  n: FittingNode,
  netFlow: number,
  nodes: Node[],
  edges: Edge[],
): FittingNode => {
  if (!n.diameter || n.diameter <= 0)
    return {
      ...n,
      inletPressure: 0,
      outletPressure: 0,
      flowRate: 0,
      velocity: 0,
    };

  const inletEdge = edges.find((e) => e.targetId === n.id);
  const inletNode = inletEdge
    ? nodes.find((x) => x.id === inletEdge.sourceId)
    : null;
  const inletP = inletNode?.outletPressure ?? 0;

  const D = n.diameter / 100; // [cm→m]
  const area = Math.PI * (D / 2) ** 2; // [m²]
  const v = area > 0 ? Math.abs(netFlow) / 1000 / area : 0; // [m/s]

  const C =
    FITTING_COEFFICIENTS[n.subtype as keyof typeof FITTING_COEFFICIENTS] ||
    FITTING_COEFFICIENTS.default;

  const headLossM = (C * v ** 2) / (2 * 9.81); // [m]
  const minorLoss = headLossM * (GRAVITY_PRESSURE / 100000); // [bar]
  const elevLoss = n.elevation * (GRAVITY_PRESSURE / 100000); // [bar]

  const outletP = Math.max(0, inletP - minorLoss - elevLoss);

  return {
    ...n,
    flowRate: netFlow,
    velocity: v,
    minorLossCoefficient: C,
    inletPressure: inletP,
    outletPressure: outletP,
  };
};

const updateValve = (n: ValveNode, netFlow: number): ValveNode =>
  n.status === "close"
    ? { ...n, flowRate: 0, inletPressure: 0, outletPressure: 0 }
    : {
        ...n,
        flowRate: netFlow,
        inletPressure: n.inletPressure || 0,
        outletPressure: Math.max(
          0,
          (n.inletPressure || 0) - (n.minorLossCoefficient || 0.05),
        ),
      };

export const simulateStep = (nodes: Node[], edges: Edge[]) => {
  const initNodes = nodes.map((n) => {
    if (!n.active)
      return { ...n, flowRate: 0, inletPressure: 0, outletPressure: 0 };
    return n.type === "reservoir" ? updateReservoir(n) : n;
  });
  const nodeMap = new Map<string, Node>(initNodes.map((n) => [n.id, n]));
  const passEdges = edges.map((e) => recalculateEdge(e, nodeMap));

  const pumpNodes = initNodes
    .filter((n) => n.type === "pump")
    .map((p) => updatePump(p as PumpNode, passEdges, initNodes));
  const pumpMap = new Map(pumpNodes.map((p) => [p.id, p]));

  const mergedMap = new Map(nodeMap);
  for (const [id, pump] of pumpMap) {
    mergedMap.set(id, pump);
  }

  const finalEdges = passEdges.map((e) =>
    pumpMap.has(e.sourceId) || pumpMap.has(e.targetId)
      ? recalculateEdge(e, mergedMap)
      : e,
  );

  const nodesWithPumps = initNodes.map((n) =>
    n.type === "pump" ? pumpMap.get(n.id) ?? n : n,
  );

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
      inletPressure: 0,
      outletPressure: 0,
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

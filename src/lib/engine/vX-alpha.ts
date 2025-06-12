// v6.ts - Functional Next-Generation Simulation Engine with Store Integration
import { SIMULATION_INTERVAL } from "../../constant/globals";
import useNodeEdgeStore from "../../store/node-edge";
import useSimulationStore from "../../store/simulation";
import type { Node as NodeType, Edge as EdgeType } from "../../types/node-edge";

export type FlowMap = Record<string, number>;
export type HeadMap = Record<string, number>;

/** Hazen–Williams coefficient (pers. 2.1) */
function calcHazenWilliamsK(L: number, C: number, D: number): number {
  return (10.67 * L) / (Math.pow(C, 1.852) * Math.pow(D, 4.871));
}

/** Build EPS system (pers. 2.5–2.7) */
function buildSystem(
  nodes: NodeType[],
  edges: EdgeType[],
  demands: number[],
): { A: Map<number, number>[]; f: number[] } {
  const N = nodes.length;
  const A: Map<number, number>[] = Array.from({ length: N }, () => new Map());
  const f = [...demands];

  for (let i = 0; i < N; i++) A[i].set(i, 0);

  edges.forEach((e) => {
    const i = nodes.findIndex((n) => n.id === e.sourceId);
    const j = nodes.findIndex((n) => n.id === e.targetId);
    const k = calcHazenWilliamsK(e.length, e.roughness, e.diameter / 100);
    const g = 1 / k;

    A[i].set(i, (A[i].get(i) || 0) + g);
    A[j].set(j, (A[j].get(j) || 0) + g);
    A[i].set(j, (A[i].get(j) || 0) - g);
    A[j].set(i, (A[j].get(i) || 0) - g);
  });

  return { A, f };
}

/** Gauss–Seidel solver for A·h = f */
function solveHeads(A: Map<number, number>[], f: number[]): number[] {
  const N = f.length;
  const h = Array(N).fill(0);
  const tol = 1e-6;

  for (let iter = 0; iter < 1000; iter++) {
    let maxError = 0;
    for (let i = 0; i < N; i++) {
      let sum = 0,
        aii = 0;
      A[i].forEach((aij, j) => {
        if (j === i) aii = aij;
        else sum += aij * h[j];
      });
      const newHi = (f[i] - sum) / aii;
      maxError = Math.max(maxError, Math.abs(newHi - h[i]));
      h[i] = newHi;
    }
    if (maxError < tol) break;
  }
  return h;
}

/** Compute flows based on head differences */
function computeFlows(
  nodes: NodeType[],
  edges: EdgeType[],
  heads: number[],
): FlowMap {
  return edges.reduce((flows, e) => {
    const i = nodes.findIndex((n) => n.id === e.sourceId);
    const j = nodes.findIndex((n) => n.id === e.targetId);
    const deltaH = heads[i] - heads[j];
    const k = calcHazenWilliamsK(e.length, e.roughness, e.diameter / 100);
    const Qm3 = Math.sign(deltaH) * Math.pow(Math.abs(deltaH) / k, 1 / 1.852);
    const Qlps = Qm3 * 1000; // m3/s to L/s
    flows[e.id] = Qlps;
    return flows;
  }, {} as FlowMap);
}

/** Compute velocities for each edge */
function computeVelocities(
  edges: EdgeType[],
  flows: FlowMap,
): Record<string, number> {
  const velMap: Record<string, number> = {};
  edges.forEach((e) => {
    const Qlps = flows[e.id] || 0;
    const Qm3 = Qlps / 1000; // L/s to m3/s
    const Dm = e.diameter / 100; // cm to m
    const area = (Math.PI * Dm ** 2) / 4;
    velMap[e.id] = area > 0 ? Qm3 / area : 0; // m/s
  });
  return velMap;
}

/** Single-step simulation */
function simulateStep(
  nodes: NodeType[],
  edges: EdgeType[],
): { heads: HeadMap; flows: FlowMap; velocities: Record<string, number> } {
  const demands = nodes.map((n) => n.flowRate);
  const { A, f } = buildSystem(nodes, edges, demands);
  const headsArray = solveHeads(A, f);
  const flows = computeFlows(nodes, edges, headsArray);
  const velocities = computeVelocities(edges, flows);

  const headMap: HeadMap = {};
  nodes.forEach((n, idx) => (headMap[n.id] = headsArray[idx]));

  return { heads: headMap, flows, velocities };
}

let simulationInterval: number | null = null;

/**
 * Jalankan simulasi realtime seperti v5: baca store, update state, loop
 */
export function startSimulation() {
  if (simulationInterval) return;
  useSimulationStore.setState({ running: true, paused: false });

  simulationInterval = window.setInterval(() => {
    const { nodes, edges } = useNodeEdgeStore.getState();
    const { heads, flows, velocities } = simulateStep(nodes, edges);

    // Update store with pressure, flowRate, velocity
    useNodeEdgeStore.setState((state) => ({
      ...state,
      nodes: state.nodes.map((n) => ({
        ...n,
        inletPressure: heads[n.id] ?? n.inletPressure,
        outletPressure: heads[n.id] ?? n.outletPressure,
        velocity: velocities[n.flowRate] ?? n.velocity, // if node velocity needed
      })),
      edges: state.edges.map((e) => ({
        ...e,
        flowRate: flows[e.id] ?? e.flowRate,
        velocity: velocities[e.id] ?? e.velocity,
      })),
    }));

    useSimulationStore.setState((state) => ({
      step: state.step + 1,
      elapsedTime: state.elapsedTime + SIMULATION_INTERVAL / 1000,
    }));
  }, SIMULATION_INTERVAL);
}

/** Stop simulation */
export function stopSimulation() {
  if (simulationInterval !== null) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    useSimulationStore.setState({ running: false, paused: false });
  }
}

export function resetSimulation() {
  useNodeEdgeStore.setState({ nodes: [], edges: [] });
  useSimulationStore.setState({ running: false, paused: false });
}

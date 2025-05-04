import { GRAVITY_PRESSURE } from "@/constant/globals";
import useNodeEdgeStore from "@/store/node-edge";
import useSimulationStore from "@/store/simulation";

let simulationInterval: NodeJS.Timeout | null = null;

export const startSimulation = () => {
  if (simulationInterval) return;

  useSimulationStore.setState({ running: true });

  simulationInterval = setInterval(() => {
    const { nodes: currentNodes, edges: currentEdges } =
      useNodeEdgeStore.getState();

    const nodePressureMap = new Map(
      currentNodes.map((n) => {
        if (n.type === "reservoir") return [n.id, n.head * GRAVITY_PRESSURE];
        if (n.type === "tank") return [n.id, n.level * GRAVITY_PRESSURE];
        return [n.id, n.pressure];
      }),
    );

    useSimulationStore.setState((state) => ({
      step: state.step + 1,
      elapsedTime: state.elapsedTime + 1,
    }));

    const newEdges = currentEdges.map((edge) => {
      const sourcePressure = nodePressureMap.get(edge.sourceId) ?? 0;
      const targetPressure = nodePressureMap.get(edge.targetId) ?? 0;

      const pressureDiff = sourcePressure - targetPressure;
      const headLoss = (edge.length * edge.diameter) / (edge.roughness * 1000);
      let flowRate = pressureDiff - headLoss;

      if (flowRate < 0) flowRate = 0;

      return {
        ...edge,
        flowRate,
      };
    });

    const edgeByTarget = newEdges.reduce<Record<string, number[]>>(
      (acc, edge) => {
        if (!acc[edge.targetId]) acc[edge.targetId] = [];
        acc[edge.targetId].push(edge.flowRate);
        return acc;
      },
      {},
    );

    const newNodes = currentNodes.map((node) => {
      const incomingFlows = edgeByTarget[node.id] ?? [];
      const totalFlow = incomingFlows.reduce((sum, f) => sum + f, 0);

      if (node.type === "reservoir") {
        return {
          ...node,
          flowRate: totalFlow,
          pressure: node.head * GRAVITY_PRESSURE,
        };
      }

      if (node.type === "tank") {
        return {
          ...node,
          flowRate: totalFlow,
          pressure: node.level * GRAVITY_PRESSURE,
        };
      }

      return {
        ...node,
        flowRate: totalFlow,
        pressure: totalFlow,
      };
    });

    useNodeEdgeStore.setState({
      nodes: newNodes,
      edges: newEdges,
    });
  }, 1000);
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
    })),
    edges: state.edges.map((edge) => ({
      ...edge,
      flowRate: 0,
    })),
  }));

  useSimulationStore.setState({
    running: false,
    paused: false,
    step: 0,
    elapsedTime: 0,
  });
};

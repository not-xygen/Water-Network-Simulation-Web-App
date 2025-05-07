import { GRAVITY_PRESSURE, PIXEL_TO_CM } from "@/constant/globals";
import useNodeEdgeStore from "@/store/node-edge";
import useSimulationStore from "@/store/simulation";

let simulationInterval: NodeJS.Timeout | null = null;

export const startSimulation = () => {
  if (simulationInterval) return;

  useSimulationStore.setState({ running: true });

  simulationInterval = setInterval(() => {
    const { nodes, edges } = useNodeEdgeStore.getState();

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    useSimulationStore.setState((state) => ({
      step: state.step + 1,
      elapsedTime: state.elapsedTime + 1,
    }));

    const newEdges = edges.map((edge) => {
      const sourceNode = nodeMap.get(edge.sourceId);
      const targetNode = nodeMap.get(edge.targetId);

      let sourcePressure = 0;
      const lengthM = (edge.length * PIXEL_TO_CM) / 100;
      const diameterM = edge.diameter / 100;
      const roughnessC = edge.roughness;

      if (sourceNode?.type === "reservoir")
        sourcePressure = (sourceNode.head * GRAVITY_PRESSURE) / 100;
      else if (sourceNode?.type === "tank") sourcePressure = sourceNode.level;
      else sourcePressure = sourceNode?.pressure ?? 0;

      const targetPressure = targetNode?.pressure ?? 0;
      const pressureDiff = sourcePressure - targetPressure;

      const slope = Math.max(pressureDiff / lengthM, 0.00001);

      const flowRate = 0.849 * roughnessC * diameterM ** 2.63 * slope ** 0.54;

      const area = Math.PI * (diameterM / 2) ** 2;
      const velocity = area === 0 ? 0 : flowRate / area;

      return {
        ...edge,
        flowRate,
        velocity,
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

    const nextNodes = nodes.map((node) => {
      const incomingFlows = edgeByTarget[node.id] ?? [];
      const totalFlow = incomingFlows.reduce((sum, f) => sum + f, 0);

      if (node.type === "reservoir") {
        return {
          ...node,
          pressure: (node.head * GRAVITY_PRESSURE) / 100,
          flowRate: totalFlow,
        };
      }

      if (node.type === "tank") {
        return {
          ...node,
          pressure: node.level * GRAVITY_PRESSURE,
          flowRate: totalFlow,
        };
      }

      return {
        ...node,
        pressure: totalFlow,
        flowRate: totalFlow,
      };
    });

    useNodeEdgeStore.setState({
      nodes: nextNodes,
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

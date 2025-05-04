import useNodeEdgeStore from "@/store/node-edge";
import useSimulationStore from "@/store/simulation";

let simulationInterval: NodeJS.Timeout | null = null;

export const startSimulation = () => {
  if (simulationInterval) return;

  useSimulationStore.setState({
    running: true,
  });

  simulationInterval = setInterval(() => {
    useSimulationStore.setState((state) => ({
      step: state.step + 1,
      elapsedTime: state.elapsedTime + 1,
    }));

    useNodeEdgeStore.setState((state) => {
      const updatedNodes = state.nodes.map((node) => {
        if (!node.active) return node;

        return {
          ...node,
          flowRate: (node.flowRate ?? 0) + 1,
          pressure: (node.pressure ?? 0) + 0.5,
        };
      });

      const updatedEdges = state.edges.map((edge) => {
        if (edge.status !== "open") return edge;

        return {
          ...edge,
          flowRate: (edge.flowRate ?? 0) + 1,
        };
      });

      return {
        nodes: updatedNodes,
        edges: updatedEdges,
      };
    });
  }, 1000);
};

export const stopSimulation = () => {
  if (!simulationInterval) return;

  clearInterval(simulationInterval);
  simulationInterval = null;

  useSimulationStore.setState({
    running: false,
  });
};

export const resetSimulation = () => {
  stopSimulation();

  useSimulationStore.setState({
    running: false,
    step: 0,
    elapsedTime: 0,
  });

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
};

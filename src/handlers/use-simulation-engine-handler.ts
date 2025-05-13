import {
  FITTING_COEFFICIENTS,
  GRAVITY_PRESSURE,
  PIXEL_TO_CM,
} from "@/constant/globals";
import useNodeEdgeStore from "@/store/node-edge";
import useSimulationStore from "@/store/simulation";

let simulationInterval: NodeJS.Timeout | null = null;
const MIN_SLOPE = 0.00001;

const calculateMinorLoss = (velocity: number, coefficient: number) => {
  return (coefficient * velocity ** 2) / 20000;
};

export const startSimulation = () => {
  if (simulationInterval) return;

  useSimulationStore.setState({ running: true });

  simulationInterval = setInterval(() => {
    try {
      const { nodes, edges } = useNodeEdgeStore.getState();

      const initialNodes = nodes.map((node) => {
        if (!node.active) return node;

        if (node.type === "reservoir") {
          return {
            ...node,
            pressure: (node.head * GRAVITY_PRESSURE) / 100,
          };
        }

        if (node.type === "pump") {
          return {
            ...node,
            pressure: node.pressure ?? 50000,
          };
        }

        return node;
      });

      const nodeMap = new Map(initialNodes.map((n) => [n.id, n]));

      useSimulationStore.setState((state) => ({
        step: state.step + 1,
        elapsedTime: state.elapsedTime + 1,
      }));

      const newEdges = edges.map((edge) => {
        const sourceNode = nodeMap.get(edge.sourceId);
        const targetNode = nodeMap.get(edge.targetId);

        if (
          !sourceNode ||
          !targetNode ||
          !sourceNode.active ||
          !targetNode.active
        ) {
          return { ...edge, flowRate: 0, velocity: 0 };
        }

        let sourcePressure = 0;
        const lengthM = (edge.length * PIXEL_TO_CM) / 100;
        const diameterM = edge.diameter / 100;
        const roughnessC = edge.roughness;

        if (sourceNode.type === "reservoir")
          sourcePressure = (sourceNode.head * GRAVITY_PRESSURE) / 100;
        else if (sourceNode.type === "tank")
          sourcePressure = sourceNode.currentVolumeHeight;
        else if (sourceNode.type === "fitting")
          sourcePressure = sourceNode.outletPressure || 0;
        else sourcePressure = sourceNode.pressure ?? 0;

        const targetPressure = targetNode.pressure ?? 0;
        const pressureDiff = sourcePressure - targetPressure;

        if (pressureDiff <= 0) {
          return { ...edge, flowRate: 0, velocity: 0 };
        }

        const slope = Math.max(pressureDiff / lengthM, MIN_SLOPE);

        let flowRate = 0;
        if (sourceNode.type === "fitting") {
          const fittingDiameterM = sourceNode.diameter / 100;
          const effectiveDiameter = Math.min(fittingDiameterM, diameterM);
          flowRate =
            0.849 * roughnessC * effectiveDiameter ** 2.63 * slope ** 0.54;
          const maxFlow = sourceNode.flowRate || 0;
          flowRate = Math.min(flowRate, maxFlow);

          if (flowRate < 0.1) {
            flowRate = maxFlow;
          }
        } else {
          flowRate = 0.849 * roughnessC * diameterM ** 2.63 * slope ** 0.54;
        }

        if (flowRate <= 0) {
          return { ...edge, flowRate: 0, velocity: 0 };
        }

        const area = Math.PI * (diameterM / 2) ** 2;
        const velocity = area === 0 ? 0 : flowRate / 1000 / area;

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

      const nextNodes = initialNodes.map((node) => {
        if (!node.active) {
          return { ...node, flowRate: 0, pressure: 0 };
        }

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
          if (node.diameter <= 0) {
            return {
              ...node,
              pressure: 0,
              flowRate: 0,
              currentVolume: 0,
              currentVolumeHeight: 0,
              filledPercentage: 0,
            };
          }

          const radiusM = node.diameter / 200;
          const heightM = node.height / 100;
          const baseArea = Math.PI * radiusM ** 2;

          const volumeM3 = Math.PI * radiusM ** 2 * heightM;
          const maxVolume = volumeM3 * 1000;

          const addedVolume = totalFlow * 1000;
          const updatedVolume = Math.min(
            node.currentVolume + addedVolume,
            maxVolume,
          );

          const updatedHeight = updatedVolume / 1000 / baseArea;
          const clampedHeight = Math.min(updatedHeight, heightM);

          const pressure = (clampedHeight * GRAVITY_PRESSURE) / 100;

          const filledPercentage = Math.min(
            (updatedVolume / maxVolume) * 100,
            100,
          );

          return {
            ...node,
            maxVolume,
            currentVolume: updatedVolume,
            currentVolumeHeight: clampedHeight,
            pressure,
            flowRate: totalFlow,
            filledPercentage,
          };
        }

        if (node.type === "fitting") {
          if (
            !node.diameter ||
            node.diameter <= 0 ||
            Number.isNaN(node.diameter)
          ) {
            return {
              ...node,
              pressure: 0,
              flowRate: 0,
              velocity: 0,
              inletPressure: 0,
              outletPressure: 0,
            };
          }

          const diameterM = node.diameter / 100;
          const area = Math.PI * (diameterM / 2) ** 2;
          const velocity =
            area > 0 && !Number.isNaN(totalFlow) ? totalFlow / area : 0;

          let inletPressure = 0;
          const incomingEdges = edges.filter(
            (edge) => edge.targetId === node.id,
          );
          const sourceNodes = incomingEdges
            .map((edge) => nodeMap.get(edge.sourceId))
            .filter(Boolean);
          if (sourceNodes.length > 0) {
            inletPressure = Math.max(
              ...sourceNodes.map((n) => {
                if (n?.type === "reservoir") {
                  return (n.head * GRAVITY_PRESSURE) / 100;
                }
                if (n?.type === "tank") {
                  return n.currentVolumeHeight;
                }
                if (n?.type === "fitting") {
                  return n.outletPressure || 0;
                }
                return n?.pressure || 0;
              }),
            );
          }

          if (inletPressure === 0) {
            inletPressure = node.pressure || 0;
          }

          if (Number.isNaN(inletPressure)) {
            inletPressure = 0;
          }

          const coefficient =
            FITTING_COEFFICIENTS[
              node.subtype as keyof typeof FITTING_COEFFICIENTS
            ] || FITTING_COEFFICIENTS.default;

          const minorLoss = calculateMinorLoss(velocity, coefficient);
          const elevationDiff = node.elevation || 0;
          const elevationLoss = (elevationDiff * GRAVITY_PRESSURE) / 100;

          const outletPressure = Math.max(
            0,
            inletPressure - minorLoss - elevationLoss,
          );

          console.log("== Fitting Debug ==", {
            nodeId: node.id,
            inletPressure,
            minorLoss,
            elevationDiff,
            outletPressure,
          });

          const demand = Number.isNaN(node.demand) ? 0 : node.demand || 0;
          const adjustedFlow = Math.max(0, totalFlow - demand);

          return {
            ...node,
            pressure: outletPressure,
            flowRate: adjustedFlow,
            velocity: velocity,
            inletPressure,
            outletPressure,
            minorLossCoefficient: coefficient,
          };
        }

        return {
          ...node,
          pressure: Math.max(totalFlow, 0),
          flowRate: totalFlow,
        };
      });

      useNodeEdgeStore.setState({
        nodes: nextNodes,
        edges: newEdges,
      });
    } catch (error) {
      console.error("Simulation error:", error);
      stopSimulation();
    }
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

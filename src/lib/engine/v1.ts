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

					const incomingFlows = edges
						.filter((edge) => edge.targetId === node.id)
						.map((edge) => edge.flowRate || 0);
					const totalInflow = incomingFlows.reduce((sum, f) => sum + f, 0);

					const outgoingEdges = edges.filter(
						(edge) => edge.sourceId === node.id,
					);
					const totalOutflow = outgoingEdges.reduce((sum, edge) => {
						const targetNode = nodes.find((n) => n.id === edge.targetId);
						if (!targetNode || !targetNode.active) return sum;
						return sum + (edge.flowRate || 0);
					}, 0);

					const netFlow = totalInflow - totalOutflow;
					const addedVolume = netFlow * 1000;
					const updatedVolume = Math.max(
						0,
						Math.min(node.currentVolume + addedVolume, maxVolume),
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
						flowRate: netFlow,
						filledPercentage,
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

				const lengthM = (edge.length * PIXEL_TO_CM) / 100;
				const diameterM = edge.diameter / 100;
				const roughnessC = edge.roughness;

				let sourcePressure = 0;
				let targetPressure = 0;

				if (sourceNode.type === "reservoir")
					sourcePressure = (sourceNode.head * GRAVITY_PRESSURE) / 100;
				else if (sourceNode.type === "tank")
					sourcePressure = sourceNode.currentVolumeHeight ?? 0;
				else if (sourceNode.type === "fitting")
					sourcePressure = sourceNode.outletPressure ?? 0;
				else sourcePressure = sourceNode.pressure ?? 0;

				if (targetNode.type === "tank")
					targetPressure = targetNode.currentVolumeHeight ?? 0;
				else targetPressure = targetNode.pressure ?? 0;

				let pressureDiff = sourcePressure - targetPressure;

				if (targetNode.type === "pump") {
					const suctionHeadMax = targetNode.suctionHeadMax ?? 7;
					const suctionLimit = (suctionHeadMax * GRAVITY_PRESSURE) / 100;
					const EPSILON = 0.00001;

					const safeSourcePressure =
						sourceNode.type === "fitting"
							? (sourceNode.outletPressure ?? sourceNode.pressure ?? 0)
							: (sourceNode.pressure ?? 0);

					if (safeSourcePressure + EPSILON >= suctionLimit) {
						pressureDiff = Math.max(0, safeSourcePressure - 0.2);
					} else {
						pressureDiff = 0;
					}
				}

				if (pressureDiff <= 0) {
					return { ...edge, flowRate: 0, velocity: 0 };
				}

				const slope = Math.max(pressureDiff / lengthM, MIN_SLOPE);

				let flowRate = 0;
				if (sourceNode.type === "fitting") {
					const fittingDiameterM = sourceNode.diameter / 100;
					const effDiameter = Math.min(fittingDiameterM, diameterM);
					flowRate = 0.849 * roughnessC * effDiameter ** 2.63 * slope ** 0.54;
					const maxFlow = sourceNode.flowRate ?? 0;
					flowRate = Math.min(flowRate, maxFlow);
				} else {
					flowRate = 0.849 * roughnessC * diameterM ** 2.63 * slope ** 0.54;
				}

				const area = Math.PI * (diameterM / 2) ** 2;
				const velocity = area > 0 ? flowRate / 1000 / area : 0;

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
				const totalFlow = incomingFlows.reduce(
					(sum: number, f: number) => sum + f,
					0,
				);

				if (node.type === "reservoir") {
					return {
						...node,
						pressure: (node.head * GRAVITY_PRESSURE) / 100,
					};
				}

				if (node.type === "pump") {
					const incomingEdges = edges.filter((e) => e.targetId === node.id);
					const incomingFlow = incomingEdges.reduce(
						(sum, e) => sum + (e.flowRate || 0),
						0,
					);

					const maxFlow = node.capacityMax ?? 0;
					const clampedFlow = Math.min(incomingFlow, maxFlow);

					let head = node.totalHeadMax ?? 0;

					if (
						node.curveFlow &&
						node.curveHead &&
						node.curveFlow.length > 1 &&
						node.curveFlow.length === node.curveHead.length
					) {
						for (let i = 0; i < node.curveFlow.length - 1; i++) {
							const f1 = node.curveFlow[i];
							const f2 = node.curveFlow[i + 1];
							const h1 = node.curveHead[i];
							const h2 = node.curveHead[i + 1];

							if (
								(clampedFlow >= f2 && clampedFlow <= f1) ||
								(clampedFlow >= f1 && clampedFlow <= f2)
							) {
								const t = (clampedFlow - f1) / (f2 - f1);
								head = h1 + t * (h2 - h1);
								break;
							}
						}
					}

					head = Math.min(head, node.totalHeadMax ?? head);

					const pressure = (head * GRAVITY_PRESSURE) / 100;

					return {
						...node,
						pressure,
						flowRate: clampedFlow,
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

					const totalInflow = totalFlow;

					const outgoingEdges = edges.filter(
						(edge) => edge.sourceId === node.id,
					);
					const totalOutflow = outgoingEdges.reduce((sum, edge) => {
						const targetNode = nodeMap.get(edge.targetId);
						if (!targetNode || !targetNode.active) return sum;
						return sum + (edge.flowRate || 0);
					}, 0);

					const netFlow = totalInflow - totalOutflow;
					const addedVolume = netFlow * 1000;
					const updatedVolume = Math.max(
						0,
						Math.min(node.currentVolume + addedVolume, maxVolume),
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
						flowRate: netFlow,
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
					const totalFlow = incomingFlows.reduce(
						(sum: number, f: number) => sum + f,
						0,
					);
					const velocity =
						area > 0 && !Number.isNaN(totalFlow) ? totalFlow / 1000 / area : 0;

					let inletPressure = 0;
					const incomingEdges = edges.filter(
						(edge) => edge.targetId === node.id,
					);
					const sourceNodes = incomingEdges
						.map((edge) => nodes.find((n) => n.id === edge.sourceId))
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

				if (node.type === "valve") {
					const incomingFlows = edgeByTarget[node.id] ?? [];
					const totalFlow = incomingFlows.reduce((sum, f) => sum + f, 0);

					if (node.status === "close") {
						return {
							...node,
							flowRate: 0,
							pressure: 0,
						};
					}

					const loss = node.lossCoefficient ?? 0.05;
					const pressure = Math.max(0, node.pressure - loss);

					return {
						...node,
						flowRate: totalFlow,
						pressure,
					};
				}

				return node;
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

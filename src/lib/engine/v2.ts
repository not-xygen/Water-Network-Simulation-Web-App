import {
	FITTING_COEFFICIENTS,
	GRAVITY_PRESSURE,
	PIXEL_TO_CM,
} from "@/constant/globals";
import useNodeEdgeStore from "@/store/node-edge";
import useSimulationStore from "@/store/simulation";

let simulationInterval: NodeJS.Timeout | null = null;
const MIN_SLOPE = 0.00001;

const GRAVITY_PRESSURE_DIV_100 = GRAVITY_PRESSURE / 100;
const PIXEL_TO_METER = PIXEL_TO_CM / 100;
const SIMULATION_INTERVAL = 1000;

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

				switch (node.type) {
					case "reservoir":
						return {
							...node,
							pressure: node.head * GRAVITY_PRESSURE_DIV_100,
						};

					default:
						return node;
				}
			});

			const updatedNodeMap = new Map(initialNodes.map((n) => [n.id, n]));

			useSimulationStore.setState((state) => ({
				step: state.step + 1,
				elapsedTime: state.elapsedTime + 1,
			}));

			const newEdges = edges.map((edge) => {
				const sourceNode = updatedNodeMap.get(edge.sourceId);
				const targetNode = updatedNodeMap.get(edge.targetId);

				if (!sourceNode?.active || !targetNode?.active) {
					return { ...edge, flowRate: 0, velocity: 0 };
				}

				const lengthM = edge.length * PIXEL_TO_METER;
				const diameterM = edge.diameter / 100;
				const roughnessC = edge.roughness;

				let sourcePressure = 0;
				switch (sourceNode.type) {
					case "reservoir":
						sourcePressure = sourceNode.head * GRAVITY_PRESSURE_DIV_100;
						break;
					case "tank":
						sourcePressure = sourceNode.currentVolumeHeight ?? 0;
						break;
					case "fitting":
						sourcePressure = sourceNode.outletPressure ?? 0;
						break;
					default:
						sourcePressure = sourceNode.pressure ?? 0;
				}

				const targetPressure =
					targetNode.type === "tank"
						? (targetNode.currentVolumeHeight ?? 0)
						: (targetNode.pressure ?? 0);

				let pressureDiff = sourcePressure - targetPressure;

				if (targetNode.type === "pump") {
					const suctionLimit =
						(targetNode.suctionHeadMax ?? 0) * GRAVITY_PRESSURE_DIV_100;
					const safeSourcePressure =
						sourceNode.type === "fitting"
							? (sourceNode.outletPressure ?? sourceNode.pressure ?? 0)
							: (sourceNode.pressure ?? 0);

					if (safeSourcePressure + 0.00001 >= suctionLimit) {
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
					flowRate = Math.min(flowRate, sourceNode.flowRate ?? flowRate);
				} else {
					flowRate = 0.849 * roughnessC * diameterM ** 2.63 * slope ** 0.54;
				}

				const area = Math.PI * (diameterM / 2) ** 2;
				const velocity = area > 0 ? flowRate / 1000 / area : 0;

				return { ...edge, flowRate, velocity };
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
				if (!node.active) return { ...node, flowRate: 0, pressure: 0 };

				const incomingFlows = edgeByTarget[node.id] ?? [];
				const totalFlow = incomingFlows.reduce((sum, f) => sum + f, 0);

				switch (node.type) {
					case "reservoir":
						return {
							...node,
							pressure: node.head * GRAVITY_PRESSURE_DIV_100,
						};

					case "pump": {
						const incomingEdges = edges.filter((e) => e.targetId === node.id);
						const incomingFlow = incomingEdges.reduce(
							(sum, e) => sum + (e.flowRate || 0),
							0,
						);
						const clampedFlow = Math.min(incomingFlow, node.capacityMax ?? 0);

						let head = node.totalHeadMax ?? 0;
						if (
							node.curveFlow?.length > 1 &&
							node.curveFlow.length === node.curveHead?.length
						) {
							for (let i = 0; i < node.curveFlow.length - 1; i++) {
								if (
									(clampedFlow >= node.curveFlow[i] &&
										clampedFlow <= node.curveFlow[i + 1]) ||
									(clampedFlow <= node.curveFlow[i] &&
										clampedFlow >= node.curveFlow[i + 1])
								) {
									const t =
										(clampedFlow - node.curveFlow[i]) /
										(node.curveFlow[i + 1] - node.curveFlow[i]);
									head =
										node.curveHead[i] +
										t * (node.curveHead[i + 1] - node.curveHead[i]);
									break;
								}
							}
						}

						head = Math.min(head, node.totalHeadMax ?? head);
						return {
							...node,
							pressure: head * GRAVITY_PRESSURE_DIV_100,
							flowRate: clampedFlow,
						};
					}

					case "tank": {
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
						const maxVolume = Math.PI * radiusM ** 2 * heightM * 1000;

						const outgoingEdges = edges.filter(
							(edge) => edge.sourceId === node.id,
						);
						const totalOutflow = outgoingEdges.reduce((sum, edge) => {
							const targetNode = updatedNodeMap.get(edge.targetId);
							return sum + (targetNode?.active ? edge.flowRate || 0 : 0);
						}, 0);

						const netFlow = totalFlow - totalOutflow;
						const addedVolume = netFlow * 1000;
						const updatedVolume = Math.max(
							0,
							Math.min(node.currentVolume + addedVolume, maxVolume),
						);
						const updatedHeight = updatedVolume / 1000 / baseArea;
						const clampedHeight = Math.min(updatedHeight, heightM);

						return {
							...node,
							maxVolume,
							currentVolume: updatedVolume,
							currentVolumeHeight: clampedHeight,
							pressure: clampedHeight * GRAVITY_PRESSURE_DIV_100,
							flowRate: netFlow,
							filledPercentage: Math.min(
								(updatedVolume / maxVolume) * 100,
								100,
							),
						};
					}

					case "fitting": {
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
						const velocity = area > 0 ? totalFlow / 1000 / area : 0;

						const incomingEdges = edges.filter(
							(edge) => edge.targetId === node.id,
						);
						let inletPressure = incomingEdges.reduce((maxPressure, edge) => {
							const sourceNode = updatedNodeMap.get(edge.sourceId);
							if (!sourceNode) return maxPressure;

							let sourcePressure = 0;
							switch (sourceNode.type) {
								case "reservoir":
									sourcePressure = sourceNode.head * GRAVITY_PRESSURE_DIV_100;
									break;
								case "tank":
									sourcePressure = sourceNode.currentVolumeHeight ?? 0;
									break;
								case "fitting":
									sourcePressure = sourceNode.outletPressure ?? 0;
									break;
								default:
									sourcePressure = sourceNode.pressure ?? 0;
							}
							return Math.max(maxPressure, sourcePressure);
						}, node.pressure || 0);

						if (Number.isNaN(inletPressure)) inletPressure = 0;

						const coefficient =
							FITTING_COEFFICIENTS[
								node.subtype as keyof typeof FITTING_COEFFICIENTS
							] || FITTING_COEFFICIENTS.default;

						const minorLoss = calculateMinorLoss(velocity, coefficient);
						const elevationLoss =
							(node.elevation || 0) * GRAVITY_PRESSURE_DIV_100;

						const targetOutletPressure = Math.max(
							0,
							inletPressure - minorLoss - elevationLoss,
						);
						const outletPressure = node.outletPressure
							? node.outletPressure * 0.7 + targetOutletPressure * 0.3
							: targetOutletPressure;

						const demand = node.demand || 0;
						const adjustedFlow = Math.max(0, totalFlow - demand);

						return {
							...node,
							pressure: outletPressure,
							flowRate: adjustedFlow,
							velocity,
							inletPressure,
							outletPressure,
							minorLossCoefficient: coefficient,
						};
					}

					case "valve":
						if (node.status === "close") {
							return { ...node, flowRate: 0, pressure: 0 };
						}
						return {
							...node,
							flowRate: totalFlow,
							pressure: Math.max(
								0,
								(node.pressure || 0) - (node.lossCoefficient ?? 0.05),
							),
						};

					default:
						return node;
				}
			});

			useNodeEdgeStore.setState({
				nodes: nextNodes,
				edges: newEdges,
			});
		} catch (error) {
			console.error("Simulation error:", error);
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
	useNodeEdgeStore.setState((state) => ({
		nodes: state.nodes.map((node) => ({
			...node,
			flowRate: 0,
			pressure: 0,
			...(node.type === "tank"
				? {
						currentVolume: 0,
						currentVolumeHeight: 0,
						filledPercentage: 0,
					}
				: {}),
			...(node.type === "fitting"
				? {
						inletPressure: 0,
						outletPressure: 0,
						velocity: 0,
					}
				: {}),
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

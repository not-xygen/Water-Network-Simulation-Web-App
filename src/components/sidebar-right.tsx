import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	resetSimulation,
	startSimulation,
	stopSimulation,
} from "@/handlers/use-engine-v4-handler";
import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";
import useSimulationStore from "@/store/simulation";
import type { Edge, Node } from "@/types/node-edge";

import { EdgeProperties } from "./edge-properties";
import { NodeProperties } from "./node-properties";
import { SimulationControls } from "./simulation-controls";
import { ViewControls } from "./view-controls";

export const SidebarRight = () => {
	const { zoom, resetZoom, zoomIn, zoomOut, offset, setOffset } =
		useGlobalStore();
	const { nodes, selectedNodes, removeNode, edges, selectedEdges, removeEdge } =
		useNodeEdgeStore();

	const running = useSimulationStore((s) => s.running);
	const paused = useSimulationStore((s) => s.paused);
	const elapsedTime = useSimulationStore((s) => s.elapsedTime);

	const resetPosition = () => setOffset(0, 0);

	const displayX = -offset.x;
	const displayY = offset.y;

	const updateNodeProperty = (key: keyof Node, value: Node[keyof Node]) => {
		const node = selectedNodes[0];
		if (!node) return;

		useNodeEdgeStore.setState((state) => ({
			nodes: state.nodes.map((n) =>
				n.id === node.id ? { ...n, [key]: value } : n,
			),
			selectedNodes: [{ ...node, [key]: value }],
		}));
	};

	const updateEdgeProperty = (key: keyof Edge, value: Edge[keyof Edge]) => {
		const edge = selectedEdges[0];
		if (!edge) return;

		useNodeEdgeStore.setState((state) => ({
			edges: state.edges.map((e) =>
				e.id === edge.id ? { ...e, [key]: value } : e,
			),
			selectedEdges: [{ ...edge, [key]: value }],
		}));
	};

	const liveSelectedNodes = selectedNodes.map(
		(selected) => nodes.find((n) => n.id === selected.id) ?? selected,
	);

	const liveSelectedEdges = selectedEdges.map(
		(selected) => edges.find((n) => n.id === selected.id) ?? selected,
	);

	return (
		<div className="w-full h-full p-2 overflow-y-auto text-xs text-gray-700 border-l">
			<ViewControls
				zoom={zoom}
				displayX={displayX}
				displayY={displayY}
				zoomIn={zoomIn}
				zoomOut={zoomOut}
				resetZoom={resetZoom}
				resetPosition={resetPosition}
			/>

			<Tabs defaultValue="editor" className="w-full mt-3">
				<TabsList className="w-full">
					<TabsTrigger
						className="w-full"
						value="editor"
						onClick={() => {
							stopSimulation();
						}}
					>
						Editor
					</TabsTrigger>
					<TabsTrigger className="w-full" value="simulation" onClick={() => {}}>
						Simulation
					</TabsTrigger>
				</TabsList>

				<TabsContent value="editor">
					{selectedNodes.length > 0 && selectedEdges.length === 0 && (
						<NodeProperties
							node={selectedNodes[0]}
							liveNode={liveSelectedNodes[0]}
							onUpdateProperty={updateNodeProperty}
							onDelete={removeNode}
						/>
					)}

					{selectedEdges.length > 0 && selectedNodes.length === 0 && (
						<EdgeProperties
							edge={selectedEdges[0]}
							liveEdge={liveSelectedEdges[0]}
							onUpdateProperty={updateEdgeProperty}
							onDelete={removeEdge}
						/>
					)}
				</TabsContent>

				<TabsContent value="simulation">
					<SimulationControls
						running={running}
						paused={paused}
						elapsedTime={elapsedTime}
						onStart={startSimulation}
						onStop={stopSimulation}
						onReset={resetSimulation}
					/>

					{selectedNodes.length > 0 && selectedEdges.length === 0 && (
						<NodeProperties
							node={selectedNodes[0]}
							liveNode={liveSelectedNodes[0]}
							onUpdateProperty={updateNodeProperty}
							onDelete={removeNode}
							isSimulation
						/>
					)}

					{selectedEdges.length > 0 && selectedNodes.length === 0 && (
						<EdgeProperties
							edge={selectedEdges[0]}
							liveEdge={liveSelectedEdges[0]}
							onUpdateProperty={updateEdgeProperty}
							onDelete={removeEdge}
							isSimulation
						/>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
};

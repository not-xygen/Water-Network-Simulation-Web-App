import type { Edge, Node } from "@/types/node-edge";
import { create } from "zustand";
/* eslint-disable no-unused-vars */

export type NodeEdgeState = {
	nodes: Node[];
	addNode: (node: Node) => void;
	updateNodePosition: (id: string, deltaX: number, deltaY: number) => void;
	updateNodeRotation: (id: string, angle: number) => void;
	removeNode: (id: string) => void;
	edges: Edge[];
	addEdge: (edge: Edge) => void;
	updateEdgeConnection: (
		edgeId: string,
		args: {
			from: "source" | "target";
			newNodeId: string;
			newPosition: Edge["sourcePosition"];
		},
	) => void;
	updateEdgeLengthByNode: (nodeId: string) => void;
	removeEdge: (id: string) => void;
	selectedNodes: Node[];
	setSelectedNodes: (nodes: Node[]) => void;
	selectedEdges: Edge[];
	setSelectedEdges: (edges: Edge[]) => void;
};

const useNodeEdgeStore = create<NodeEdgeState>((set) => ({
	nodes: [],
	addNode: (node) =>
		set((state) => ({
			nodes: [...state.nodes, node],
		})),
	updateNodePosition: (id, deltaX, deltaY) =>
		set((state) => {
			const newNodes = state.nodes.map((node) =>
				node.id === id
					? {
							...node,
							position: {
								x: node.position.x + deltaX,
								y: node.position.y + deltaY,
							},
						}
					: node,
			);

			const nodeEdgeStore = useNodeEdgeStore.getState();
			nodeEdgeStore.updateEdgeLengthByNode(id);

			return { nodes: newNodes };
		}),
	updateNodeRotation: (id, angle) =>
		set((state) => ({
			nodes: state.nodes.map((node) =>
				node.id === id
					? {
							...node,
							rotation: angle,
						}
					: node,
			),
		})),
	removeNode: (id) =>
		set((state) => ({
			nodes: state.nodes.filter((node) => node.id !== id),
			edges: state.edges.filter(
				(edge) => edge.sourceId !== id && edge.targetId !== id,
			),
			selectedNodes: state.selectedNodes.filter((node) => node.id !== id),
			selectedEdges: state.selectedEdges.filter(
				(edge) => edge.sourceId !== id && edge.targetId !== id,
			),
		})),
	edges: [],
	addEdge: (edge) =>
		set((state) => {
			const exists = state.edges.some(
				(e) =>
					e.sourceId === edge.sourceId &&
					e.targetId === edge.targetId &&
					e.sourcePosition === edge.sourcePosition &&
					e.targetPosition === edge.targetPosition,
			);
			if (exists) return state;
			return { edges: [...state.edges, edge] };
		}),
	updateEdgeConnection: (edgeId, { from, newNodeId, newPosition }) =>
		set((state) => ({
			edges: state.edges.map((edge) => {
				if (edge.id !== edgeId) return edge;
				return {
					...edge,
					...(from === "source"
						? { sourceId: newNodeId, sourcePosition: newPosition }
						: { targetId: newNodeId, targetPosition: newPosition }),
				};
			}),
		})),
	updateEdgeLengthByNode: (nodeId: string) =>
		set((state) => {
			const node = state.nodes.find((n) => n.id === nodeId);
			if (!node) return state;

			return {
				edges: state.edges.map((edge) => {
					if (edge.sourceId !== nodeId && edge.targetId !== nodeId) return edge;

					const sourceNode = state.nodes.find((n) => n.id === edge.sourceId);
					const targetNode = state.nodes.find((n) => n.id === edge.targetId);

					if (!sourceNode || !targetNode) return edge;

					const dx = targetNode.position.x - sourceNode.position.x;
					const dy = targetNode.position.y - sourceNode.position.y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					return {
						...edge,
						length: Math.round(distance),
					};
				}),
			};
		}),

	removeEdge: (id) =>
		set((state) => ({
			edges: state.edges.filter((e) => e.id !== id),
			selectedEdges: state.selectedEdges.filter((e) => e.id !== id),
		})),
	selectedNodes: [],
	setSelectedNodes: (nodes) =>
		set(() => ({
			selectedNodes: nodes,
		})),
	selectedEdges: [],
	setSelectedEdges: (edges) =>
		set(() => ({
			selectedEdges: edges,
		})),
}));

export default useNodeEdgeStore;

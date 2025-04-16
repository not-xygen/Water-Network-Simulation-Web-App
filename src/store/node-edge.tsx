/* eslint-disable no-unused-vars */
import { create } from "zustand";

export type Edge = {
  id: string;
  sourceId: string;
  targetId: string;
};

export type Node = {
  id: string;
  type: string;
  data: { label: string | JSX.Element };
  position: { x: number; y: number };
};

export type NodeEdgeState = {
  nodes: Node[];
  addNode: (node: Node) => void;
  updateNodePosition: (id: string, deltaX: number, deltaY: number) => void;
  removeNode: (id: string) => void;
  edges: Edge[];
  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;
};

const useNodeEdgeStore = create<NodeEdgeState>((set) => ({
  nodes: [],
  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),
  updateNodePosition: (id, deltaX, deltaY) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              x: node.position.x + deltaX,
              y: node.position.y + deltaY,
            }
          : node,
      ),
    })),
  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
    })),
  edges: [],
  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge],
    })),
  removeEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    })),
}));

export default useNodeEdgeStore;
